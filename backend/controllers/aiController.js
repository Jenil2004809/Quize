const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const AIService = require('../services/aiService');

// Intelligent Knowledge Base Templates for Instant High-Quality AI Generation
const AI_TOPIC_TEMPLATES = {
  iot: [
    {
      text: "Which layer in the IoT architectural model is responsible for sensor data acquisition?",
      options: ["Perception / Sensing Layer", "Network Layer", "Application Layer", "Business Layer"],
      correctAnswers: ["Perception / Sensing Layer"],
      explanation: "The Perception Layer consists of sensors, RFID tags, and actuators that physical gather ambient data from the environment.",
      marks: 1,
      difficulty: "easy"
    },
    {
      text: "Which wireless protocol is optimized for short-range, low-power personal area networks in IoT?",
      options: ["Zigbee (IEEE 802.15.4)", "5G NR", "Ethernet IEEE 802.3", "Satellite X-Band"],
      correctAnswers: ["Zigbee (IEEE 802.15.4)"],
      explanation: "Zigbee is specifically built for low-power, low-data rate mesh networking in smart home and industrial automation.",
      marks: 1,
      difficulty: "medium"
    },
    {
      text: "What is the primary advantage of MQTT over traditional HTTP in constrained IoT deployments?",
      options: ["Publish-Subscribe architecture with minimal header overhead", "Heavy synchronous XML formatting", "Stateless connectionless UDP streaming", "Built-in video rendering"],
      correctAnswers: ["Publish-Subscribe architecture with minimal header overhead"],
      explanation: "MQTT uses a lightweight 2-byte header with pub/sub architecture, dramatically reducing battery & data consumption compared to HTTP headers.",
      marks: 1,
      difficulty: "hard"
    }
  ],
  se: [
    {
      text: "Which SDLC model is characterized by iterative development cycles called Sprints?",
      options: ["Agile Scrum", "Waterfall Model", "V-Model", "Big Bang Model"],
      correctAnswers: ["Agile Scrum"],
      explanation: "Scrum breaks software delivery into time-boxed iterations (1-4 weeks) called Sprints for continuous feedback.",
      marks: 1,
      difficulty: "easy"
    },
    {
      text: "What does the Single Responsibility Principle (SRP) state in SOLID architecture?",
      options: ["A class should have only one reason to change", "Functions must return single values", "All modules must compile in one file", "Database tables must have one primary key"],
      correctAnswers: ["A class should have only one reason to change"],
      explanation: "SRP mandates that a software module/class should be encapsulated around a single core business responsibility.",
      marks: 1,
      difficulty: "medium"
    },
    {
      text: "Which testing technique evaluates system behavior at stress boundaries exceeding normal capacity?",
      options: ["Stress & Load Testing", "Unit Testing", "Syntax Checking", "Alpha Acceptance Testing"],
      correctAnswers: ["Stress & Load Testing"],
      explanation: "Stress testing pushes system loads beyond theoretical capacity to verify failure recovery and stability under extreme spikes.",
      marks: 1,
      difficulty: "hard"
    }
  ],
  ws: [
    {
      text: "Which format is mandatory for messaging in SOAP (Simple Object Access Protocol)?",
      options: ["XML Envelope", "JSON Array", "YAML Key-Value", "Binary Buffer"],
      correctAnswers: ["XML Envelope"],
      explanation: "SOAP strictly relies on XML for formatting message headers and payloads.",
      marks: 1,
      difficulty: "easy"
    },
    {
      text: "What does WSDL stand for in Web Services architecture?",
      options: ["Web Services Description Language", "Wide System Data Link", "Web Server Directory List", "Wireless Service Definition Layer"],
      correctAnswers: ["Web Services Description Language"],
      explanation: "WSDL is an XML-based specification used to describe web service endpoints, methods, and data contracts.",
      marks: 1,
      difficulty: "medium"
    },
    {
      text: "Which HTTP method should be idempotent according to RESTful architectural guidelines?",
      options: ["PUT & GET", "POST", "PATCH", "CONNECT"],
      correctAnswers: ["PUT & GET"],
      explanation: "PUT and GET methods are idempotent, meaning multiple identical requests yield the exact same resource state as a single request.",
      marks: 1,
      difficulty: "hard"
    }
  ]
};

// @desc    Generate AI Quiz Questions based on topic and difficulty
// @route   POST /api/ai/generate-quiz
// @access  Private (Teacher/Admin)
const generateAIQuiz = async (req, res, next) => {
  try {
    const { topic, difficulty = 'mixed', count = 5 } = req.body;

    if (!topic || topic.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a topic for AI question generation.' });
    }

    const numRequested = Math.max(1, Math.min(parseInt(count || 5), 15));
    const generated = await AIService.generateQuizQuestions(topic, numRequested, difficulty);

    return res.json({
      success: true,
      topic,
      count: generated.length,
      questions: generated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate instant AI Mentor explanation for a question result
// @route   POST /api/ai/explain-question
// @access  Private (Student)
const explainQuestionWithAI = async (req, res, next) => {
  try {
    const { questionText, options, selectedAnswers, correctAnswers, explanation } = req.body;

    if (!questionText) {
      return res.status(400).json({ success: false, message: 'Question details required for AI explanation.' });
    }

    const aiBreakdown = await AIService.generateAIExplanation(
      questionText,
      options,
      selectedAnswers,
      correctAnswers,
      explanation
    );

    return res.json({
      success: true,
      aiBreakdown
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get questions categorized by difficulty for AI Adaptive Quiz mode
// @route   GET /api/ai/adaptive-questions/:quizId
// @access  Private (Student)
const getAdaptiveQuestions = async (req, res, next) => {
  try {
    const { quizId } = req.params;
    const questions = await Question.find({ quizId });

    if (!questions || questions.length === 0) {
      return res.status(404).json({ success: false, message: 'No questions found for this quiz.' });
    }

    // Categorize questions into Easy, Medium, Hard
    const easy = questions.filter(q => q.difficulty === 'easy' || q.marks <= 1);
    const medium = questions.filter(q => q.difficulty === 'medium' || q.marks === 2);
    const hard = questions.filter(q => q.difficulty === 'hard' || q.marks >= 3);

    return res.json({
      success: true,
      totalCount: questions.length,
      adaptivePool: {
        easy: easy.length > 0 ? easy : questions,
        medium: medium.length > 0 ? medium : questions,
        hard: hard.length > 0 ? hard : questions
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Interactive 1-on-1 Chat with AI Tutor for a specific question
// @route   POST /api/ai/chat
// @access  Private (Student)
const chatWithAI = async (req, res, next) => {
  try {
    const { questionContext, history, userMessage, message, userPrompt } = req.body;
    const msg = userMessage || message || userPrompt;

    if (!msg) {
      return res.status(400).json({ success: false, message: 'Message is required for AI chat.' });
    }

    const reply = await AIService.chatWithAITutor(questionContext, history || [], msg);

    return res.json({
      success: true,
      reply
    });
  } catch (error) {
    next(error);
  }
};

// Bulletproof PDF & Document Text Extractor Helper
const extractPdfTextFromBuffer = async (buffer) => {
  try {
    const pdfModule = require('pdf-parse');
    let parseFn = typeof pdfModule === 'function' ? pdfModule : (pdfModule.default || pdfModule.pdfParse);
    if (typeof parseFn === 'function') {
      const data = await parseFn(buffer);
      if (data && data.text && data.text.trim().length > 10) {
        return data.text;
      }
    }
  } catch (err) {
    console.warn('pdf-parse primary parser error, using stream fallback:', err.message);
  }

  // Fallback 1: Extract string stream text blocks from PDF buffer
  const str = buffer.toString('utf-8');
  const textMatches = str.match(/\(([^\)]+)\)\s*Tj|BT[\s\S]*?ET/g) || [];
  const cleanMatches = textMatches
    .map(m => m.replace(/[\(\)]/g, '').replace(/Tj|BT|ET/g, '').trim())
    .filter(s => s.length > 3)
    .join(' ');

  if (cleanMatches.length > 20) {
    return cleanMatches;
  }

  // Fallback 2: Clean ASCII text extract
  return str.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
};

// Universal Multi-Format Document & Handwritten Image OCR Extractor Helper
const extractDocumentOrImageText = async (file) => {
  if (!file) return '';

  const fileName = (file.originalname || '').toLowerCase();
  const mimeType = (file.mimetype || '').toLowerCase();
  const buffer = file.buffer;

  // 1. PDF Files (.pdf)
  if (mimeType.includes('pdf') || fileName.endsWith('.pdf')) {
    return await extractPdfTextFromBuffer(buffer);
  }

  // 2. Microsoft Word Documents (.docx, .doc)
  if (
    mimeType.includes('word') ||
    mimeType.includes('officedocument') ||
    fileName.endsWith('.docx') ||
    fileName.endsWith('.doc')
  ) {
    try {
      const mammoth = require('mammoth');
      const docResult = await mammoth.extractRawText({ buffer });
      if (docResult && docResult.value && docResult.value.trim().length > 10) {
        return docResult.value;
      }
    } catch (err) {
      console.warn('Word document mammoth extraction error, using fallback:', err.message);
    }
    // Word document raw text fallback
    const rawStr = buffer.toString('utf-8');
    const cleanWord = rawStr.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleanWord.length > 20) return cleanWord;
  }

  // 3. Handwritten / Printed Image OCR Scanning (.png, .jpg, .jpeg, .bmp, .webp)
  if (
    mimeType.startsWith('image/') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.bmp') ||
    fileName.endsWith('.webp')
  ) {
    try {
      const tesseract = require('tesseract.js');
      const ocrResult = await tesseract.recognize(buffer, 'eng');
      if (ocrResult && ocrResult.data && ocrResult.data.text && ocrResult.data.text.trim().length > 5) {
        return ocrResult.data.text;
      }
    } catch (err) {
      console.warn('Handwritten image OCR error:', err.message);
    }
  }

  // 4. Plain Text Files (.txt, .md, .csv, .json)
  return buffer.toString('utf-8');
};

// @desc    Scan uploaded PDF/Word document or Handwritten image and generate structured quiz questions
// @route   POST /api/ai/scan-to-quiz
// @access  Private (Teacher/Admin)
const scanToQuiz = async (req, res, next) => {
  try {
    let extractedText = '';

    // If PDF, Word document, or Handwritten image uploaded via multer memoryStorage
    if (req.file) {
      extractedText = await extractDocumentOrImageText(req.file);
    } else if (req.body.text) {
      extractedText = req.body.text;
    }

    if (!extractedText || extractedText.trim() === '') {
      return res.status(400).json({ success: false, message: 'No readable text or PDF content was extracted from the uploaded file.' });
    }

    const countRequested = Math.max(3, Math.min(parseInt(req.body.count || 5), 10));
    const generatedQuestions = await AIService.scanToQuizText(extractedText, countRequested);

    return res.json({
      success: true,
      extractedCharacters: extractedText.length,
      questionsCount: generatedQuestions.length,
      questions: generatedQuestions
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateAIQuiz,
  explainQuestionWithAI,
  getAdaptiveQuestions,
  chatWithAI,
  scanToQuiz
};
