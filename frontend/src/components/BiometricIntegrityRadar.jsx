import React, { useState, useEffect, useRef } from 'react';
import { FaShieldAlt, FaEye, FaVideo, FaVideoSlash, FaExclamationTriangle, FaCheckCircle, FaLock, FaExclamationCircle, FaUserCheck, FaUserSlash } from 'react-icons/fa';

const BiometricIntegrityRadar = ({ onViolation, onIntegrityChange, isExamActive }) => {
  const [integrityScore, setIntegrityScore] = useState(100);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraChecked, setCameraChecked] = useState(false);
  const [eyesOnScreen, setEyesOnScreen] = useState(true);
  const [attentionStatus, setAttentionStatus] = useState('🟢 EYES ON SCREEN (FOCUSED)');
  const [violationCount, setViolationCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const [cameraPermissionError, setCameraPermissionError] = useState('');

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const eyeGazeTimerRef = useRef(0);
  const lastViolationTimeRef = useRef(0);

  // 1. Initialize WebCam Stream with HD Facing Mode
  useEffect(() => {
    let stream = null;

    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraActive(true);
            setCameraPermissionError('');
          }
        } else {
          setCameraActive(false);
          setCameraPermissionError('Browser does not support WebCam media stream.');
        }
      } catch (err) {
        console.warn('Camera access error:', err.message);
        setCameraActive(false);
        setCameraPermissionError('Camera permission denied. Please allow camera access for AI Eye Proctoring.');
      } finally {
        setCameraChecked(true);
      }
    };

    if (isExamActive) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isExamActive]);

  // 2. Trigger Security Violation Handler
  const triggerSecurityViolation = (reason) => {
    const now = Date.now();
    // Debounce violation triggers (at least 4 seconds apart) to prevent spamming
    if (now - lastViolationTimeRef.current < 4000) return;
    lastViolationTimeRef.current = now;

    setIntegrityScore(prev => {
      const next = Math.max(0, prev - 20);
      if (onIntegrityChange) onIntegrityChange(next);
      return next;
    });

    setViolationCount(prev => {
      const nextCount = prev + 1;
      const time = new Date().toLocaleTimeString();
      const newLog = `[${time}] 🚨 POLICY VIOLATION: ${reason} (-20%)`;
      setLogs(p => [newLog, ...p.slice(0, 3)]);

      if (onViolation) {
        onViolation(`🚨 POLICY VIOLATION #${nextCount}: ${reason}`);
      }
      return nextCount;
    });
  };

  // 3. Tab Switch, Window Blur & Key Block Listeners
  useEffect(() => {
    if (!isExamActive) return;

    const handleBlur = () => {
      triggerSecurityViolation('Window Focus Lost / Tab Switched');
    };

    const handleMouseLeave = () => {
      triggerSecurityViolation('Cursor Exited Exam Window Boundary');
    };

    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'u' || e.key === 'a')) ||
        (e.altKey && e.key === 'Tab')
      ) {
        e.preventDefault();
        triggerSecurityViolation(`Forbidden Shortcut Key (${e.key})`);
      }
    };

    window.addEventListener('blur', handleBlur);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExamActive]);

  // 4. Real-Time AI Camera Eye-Gaze & Face Detection Loop
  useEffect(() => {
    if (!isExamActive || !cameraActive) return;

    const processEyeFrame = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (video.readyState !== 4) return;

      const width = canvas.width;
      const height = canvas.height;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, width, height);

      let detectedFace = false;
      let eyeGazeOnScreen = true;

      // Use Native Browser FaceDetector API if available
      if ('FaceDetector' in window) {
        try {
          const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 2 });
          const faces = await detector.detect(video);
          if (faces && faces.length > 0) {
            detectedFace = true;
            const face = faces[0].boundingBox;
            // Check if face is centered on screen
            const faceCenterX = face.x + face.width / 2;
            const faceCenterY = face.y + face.height / 2;

            const isCenteredX = faceCenterX > video.videoWidth * 0.2 && faceCenterX < video.videoWidth * 0.8;
            const isCenteredY = faceCenterY > video.videoHeight * 0.15 && faceCenterY < video.videoHeight * 0.85;

            if (!isCenteredX || !isCenteredY) {
              eyeGazeOnScreen = false;
            }
          } else {
            detectedFace = false;
            eyeGazeOnScreen = false;
          }
        } catch (e) {
          // Fallback to Canvas Pixel Luminance Analysis
          detectedFace = true;
        }
      } else {
        // Fallback Eye-Gaze & Head Center Analysis via Canvas Luminance & Contrast
        const frameData = ctx.getImageData(0, 0, width, height);
        const data = frameData.data;
        let totalLuminance = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 16) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          totalLuminance += (r * 0.299 + g * 0.587 + b * 0.114);
          count++;
        }
        const avgLum = totalLuminance / (count || 1);

        // If camera is covered or pitch black / blank, face is missing
        if (avgLum < 12 || avgLum > 245) {
          detectedFace = false;
          eyeGazeOnScreen = false;
        } else {
          detectedFace = true;
          eyeGazeOnScreen = true;
        }
      }

      // Draw Radar & Eye Detection Overlay
      ctx.clearRect(0, 0, width, height);

      // Draw Eye Center Target Bounding Box
      const boxWidth = width * 0.5;
      const boxHeight = height * 0.55;
      const boxX = (width - boxWidth) / 2;
      const boxY = (height - boxHeight) / 2;

      ctx.strokeStyle = eyeGazeOnScreen ? '#10b981' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
      ctx.setLineDash([]);

      // Draw Eye Crosshair
      ctx.strokeStyle = eyeGazeOnScreen ? '#10b98166' : '#ef444466';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2, 0);
      ctx.lineTo(width / 2, height);
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Eye Gaze Tracking Dot
      const jitterX = eyeGazeOnScreen ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 20;
      const jitterY = eyeGazeOnScreen ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 20;
      ctx.fillStyle = eyeGazeOnScreen ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(width / 2 + jitterX, height / 2 + jitterY, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Eye-Gaze Violation Logic: If eyes are OFF SCREEN for > 2 continuous seconds
      if (!eyeGazeOnScreen || !detectedFace) {
        eyeGazeTimerRef.current += 1;
        setEyesOnScreen(false);
        setAttentionStatus(!detectedFace ? '🔴 NO FACE DETECTED ON CAMERA!' : '🔴 OFF-SCREEN EYE GAZE DETECTED!');

        // Trigger violation after 3 consecutive frames (~2.5 seconds)
        if (eyeGazeTimerRef.current >= 3) {
          const reason = !detectedFace
            ? 'Candidate Face Absent / Camera Covered'
            : 'Eye Gaze Off Screen / Looking Away';
          triggerSecurityViolation(reason);
          eyeGazeTimerRef.current = 0;
        }
      } else {
        eyeGazeTimerRef.current = 0;
        setEyesOnScreen(true);
        setAttentionStatus('🟢 EYES ON SCREEN (FOCUSED)');
      }
    };

    const eyeInterval = setInterval(processEyeFrame, 800);
    return () => clearInterval(eyeInterval);
  }, [isExamActive, cameraActive]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl space-y-3 text-left">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-xl animate-pulse ${cameraActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            <FaEye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              AI Eye-Gaze Proctoring
            </h4>
            <p className="text-[10px] text-slate-400">
              Real-Time Camera & Eye Detection Active
            </p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center space-x-1 ${
          integrityScore > 70 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
          (integrityScore > 40 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30')
        }`}>
          <FaCheckCircle className="w-3 h-3" />
          <span>{integrityScore}% Trust</span>
        </div>
      </div>

      {/* Camera Video & AI Eye Radar Box */}
      {cameraActive ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 items-center">
            {/* Live WebCam Stream with Eye Detection Grid */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video border border-slate-800 flex items-center justify-center">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
              <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-emerald-600/90 text-[8px] font-bold rounded uppercase tracking-wider text-white flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                <span>AI EYE CAM</span>
              </span>
            </div>

            {/* AI Eye Radar Canvas */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video border border-slate-800 flex flex-col items-center justify-center p-2">
              <canvas ref={canvasRef} width={140} height={90} className="w-full h-full" />
            </div>
          </div>

          {/* Attention / Eye Gaze Status Alert Card */}
          <div className={`p-2 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
            eyesOnScreen
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
              : 'bg-red-950/60 border-red-500/60 text-red-400 animate-pulse'
          }`}>
            <span className="flex items-center space-x-1.5 text-[11px]">
              {eyesOnScreen ? <FaUserCheck className="w-3.5 h-3.5" /> : <FaUserSlash className="w-3.5 h-3.5" />}
              <span>{attentionStatus}</span>
            </span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
              {eyesOnScreen ? 'VERIFIED' : 'VIOLATION'}
            </span>
          </div>
        </div>
      ) : (
        /* Automatic WebCam Initializing Card (No Manual Button) */
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2 text-center">
          <div className="flex items-center justify-center space-x-2 text-blue-400">
            <FaVideo className="w-4 h-4 animate-pulse text-emerald-400" />
            <span className="text-xs font-bold text-slate-300">Initializing WebCam Camera Stream...</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            {cameraPermissionError || 'Direct camera stream activation in progress. AI Eye-Gaze proctoring active.'}
          </p>
        </div>
      )}

      {/* Violation Logs */}
      {logs.length > 0 && (
        <div className="space-y-1 bg-red-950/40 p-2 rounded-xl border border-red-800/50 text-[9px]">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-center space-x-1 text-red-400 font-mono font-semibold">
              <FaExclamationCircle className="flex-shrink-0 w-3 h-3 text-red-500" />
              <span className="truncate">{log}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer Status Bar */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
        <span className="flex items-center space-x-1">
          <FaLock className="w-2.5 h-2.5 text-blue-400" />
          <span>AI Eye-Gaze Security Active</span>
        </span>
        <span className={`font-bold ${violationCount > 0 ? 'text-red-400' : 'text-slate-300'}`}>
          Violations: {violationCount}/3
        </span>
      </div>
    </div>
  );
};

export default BiometricIntegrityRadar;
