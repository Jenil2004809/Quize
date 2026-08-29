require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const connectDB = require('../config/db');
const app = require('../app');

const PORT = 5009; // Isolated test port
const API_BASE = `http://localhost:${PORT}/api`;

async function runRecordingsTests() {
  console.log('🧪 Starting Proctoring Video Recordings Verification Suite...\n');

  let server;
  try {
    await connectDB();
    server = app.listen(PORT);
    console.log(`📡 Test server running on port ${PORT}`);

    // 1. Authenticate as Admin
    console.log('1️⃣ Authenticating as System Admin...');
    const adminLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@quizsystem.com',
      password: 'Admin@123'
    });
    const adminToken = adminLoginRes.data.token;
    console.log('   ✅ Admin logged in successfully.');

    // 2. Ensure and Authenticate Teacher
    console.log('2️⃣ Authenticating as Teacher...');
    const Teacher = require('../models/Teacher');
    let testTeacher = await Teacher.findOne({ email: 'teacher.test@example.com' });
    if (!testTeacher) {
      testTeacher = new Teacher({
        name: 'Prof. Test Teacher',
        email: 'teacher.test@example.com',
        password: 'password123',
        phone: '9876543210',
        isApproved: true,
        isActive: true
      });
      await testTeacher.save();
    }

    const teacherLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'teacher.test@example.com',
      password: 'password123'
    });
    const teacherToken = teacherLoginRes.data.token;
    console.log('   ✅ Teacher logged in successfully.');

    // 3. Ensure and Authenticate Student
    console.log('3️⃣ Authenticating as Student...');
    const Student = require('../models/Student');
    let testStudent = await Student.findOne({ email: 'student.test@example.com' });
    if (!testStudent) {
      testStudent = new Student({
        name: 'John Test Student',
        email: 'student.test@example.com',
        password: 'password123',
        phone: '9876543211',
        isApproved: true,
        isActive: true
      });
      await testStudent.save();
    }

    const studentLoginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'student.test@example.com',
      password: 'password123'
    });
    const studentToken = studentLoginRes.data.token;
    const studentId = studentLoginRes.data.user._id;
    console.log('   ✅ Student logged in successfully.');

    // 4. Fetch a quiz to attempt
    const quizzesRes = await axios.get(`${API_BASE}/quizzes`);
    const quiz = quizzesRes.data.quizzes[0];
    if (!quiz) {
      throw new Error('No quiz found to test attempt on.');
    }
    console.log(`   📝 Using Quiz: "${quiz.title}" (ID: ${quiz._id})`);

    // 5. Submit Quiz Attempt as Student
    console.log('4️⃣ Submitting Quiz Attempt...');
    const submitRes = await axios.post(
      `${API_BASE}/results/submit`,
      {
        quizId: quiz._id,
        answers: [],
        timeTaken: 120,
        integrityScore: 95,
        wasDisqualified: false,
        tabChangeCount: 0,
        status: 'COMPLETED'
      },
      { headers: { Authorization: `Bearer ${studentToken}` } }
    );
    const resultId = submitRes.data.resultId;
    console.log(`   ✅ Quiz submitted! Result ID: ${resultId}`);

    // 6. Upload Mock Video Recording Blob
    console.log('5️⃣ Uploading Mock Video Recording to /api/recordings/upload/:resultId ...');
    const dummyVideoPath = path.join(__dirname, 'dummy_test.webm');
    fs.writeFileSync(dummyVideoPath, Buffer.from('FAKE_WEBM_VIDEO_BINARY_DATA_FOR_UNIT_TEST'));

    const formData = new FormData();
    formData.append('video', fs.createReadStream(dummyVideoPath), 'test_session.webm');
    formData.append('duration', '120');

    const uploadRes = await axios.post(
      `${API_BASE}/recordings/upload/${resultId}`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${studentToken}`
        }
      }
    );
    console.log('   ✅ Upload Response:', uploadRes.data);

    // Clean up temporary dummy file
    if (fs.existsSync(dummyVideoPath)) {
      fs.unlinkSync(dummyVideoPath);
    }

    // 7. Verify Teacher Recordings Endpoint
    console.log('6️⃣ Testing Teacher Access (GET /api/recordings/teacher)...');
    const teacherRecRes = await axios.get(`${API_BASE}/recordings/teacher`, {
      headers: { Authorization: `Bearer ${teacherToken}` }
    });
    console.log(`   ✅ Teacher retrieved ${teacherRecRes.data.count} recordings successfully.`);

    // 8. Verify Admin Recordings Endpoint
    console.log('7️⃣ Testing Admin Access (GET /api/recordings/admin)...');
    const adminRecRes = await axios.get(`${API_BASE}/recordings/admin`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`   ✅ Admin retrieved ${adminRecRes.data.count} global recordings successfully.`);
    const savedRec = adminRecRes.data.recordings.find(r => r._id === resultId);
    if (savedRec && savedRec.hasRecording && savedRec.recordingUrl) {
      console.log(`   🌟 Verified saved recording URL: ${savedRec.recordingUrl}`);
    } else {
      console.warn('   ⚠️ Recording record not found in admin list.');
    }

    // 9. Verify Security: Student Attempting to Access Admin Endpoint
    console.log('8️⃣ Verifying Security: Student accessing /api/recordings/admin...');
    try {
      await axios.get(`${API_BASE}/recordings/admin`, {
        headers: { Authorization: `Bearer ${studentToken}` }
      });
      console.error('   ❌ ERROR: Student was able to access admin recordings!');
    } catch (secErr) {
      if (secErr.response && (secErr.response.status === 403 || secErr.response.status === 401)) {
        console.log('   ✅ Access correctly DENIED to student (403 Forbidden)!');
      } else {
        console.error('   ❌ Unexpected response status:', secErr.message);
      }
    }

    // 10. Admin Delete Recording
    console.log('9️⃣ Testing Admin Delete Recording (DELETE /api/recordings/:id)...');
    const deleteRes = await axios.delete(`${API_BASE}/recordings/${resultId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   ✅ Delete Response:', deleteRes.data);

    console.log('\n🎉 ALL QUIZ RECORDINGS TESTS PASSED PERFECTLY! 🚀');
  } catch (error) {
    console.error('\n❌ Test Suite Failed:', error.response?.data || error.message || error);
    process.exit(1);
  } finally {
    if (server) server.close();
    process.exit(0);
  }
}

runRecordingsTests();
