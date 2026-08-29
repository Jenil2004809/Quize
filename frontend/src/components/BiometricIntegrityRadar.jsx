import React, { useState, useEffect, useRef } from 'react';
import { FaShieldAlt, FaEye, FaVideo, FaVideoSlash, FaExclamationTriangle, FaCheckCircle, FaLock, FaExclamationCircle, FaUserCheck, FaUserSlash, FaCircle, FaMobileAlt, FaUser, FaHourglassHalf } from 'react-icons/fa';

const BiometricIntegrityRadar = ({ onViolation, onIntegrityChange, onEyeOffScreenStateChange, onStreamReady, isExamActive }) => {
  const [integrityScore, setIntegrityScore] = useState(100);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraChecked, setCameraChecked] = useState(false);
  const [headCentered, setHeadCentered] = useState(true);
  const [attentionStatus, setAttentionStatus] = useState('⏳ SETUP GRACE PERIOD (15s) - ALLOW CAMERA & SETTLE IN');
  const [violationCount, setViolationCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const [cameraPermissionError, setCameraPermissionError] = useState('');
  const [isGracePeriod, setIsGracePeriod] = useState(true);
  const [graceTimeLeft, setGraceTimeLeft] = useState(15);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const violationTimerRef = useRef(0);
  const lastViolationTimeRef = useRef(0);
  const isGracePeriodRef = useRef(true);

  // 15-Second Grace Period Countdown Timer on Quiz Entry
  useEffect(() => {
    if (!isExamActive) return;
    setIsGracePeriod(true);
    isGracePeriodRef.current = true;
    setGraceTimeLeft(15);

    const timer = setInterval(() => {
      setGraceTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsGracePeriod(false);
          isGracePeriodRef.current = false;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamActive]);

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
            try {
              await videoRef.current.play();
            } catch (e) {
              // Ignore play interrupt
            }
            setCameraActive(true);
            setCameraPermissionError('');
            if (onStreamReady) {
              onStreamReady(stream);
            }
          }
        } else {
          setCameraActive(false);
          setCameraPermissionError('Browser does not support WebCam media stream.');
        }
      } catch (err) {
        console.warn('Camera access error:', err.message);
        setCameraActive(false);
        setCameraPermissionError('Camera permission pending. Please allow camera access.');
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
    // If still in 15s calibration grace period, do NOT trigger violations!
    if (isGracePeriodRef.current) return;

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
      if (isGracePeriodRef.current) return;
      if (onEyeOffScreenStateChange) onEyeOffScreenStateChange(true);
      triggerSecurityViolation('Window Focus Lost / Tab Switched');
    };

    const handleMouseLeave = () => {
      if (isGracePeriodRef.current) return;
      if (onEyeOffScreenStateChange) onEyeOffScreenStateChange(true);
      triggerSecurityViolation('Cursor Exited Exam Window Boundary');
    };

    const handleKeyDown = (e) => {
      if (isGracePeriodRef.current) return;
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

  // 4. Real-Time AI Camera Head Pose & Secondary Device Detection Loop
  useEffect(() => {
    if (!isExamActive || !cameraActive) return;

    const processFrame = async () => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (video.readyState !== 4) return;

      const width = canvas.width;
      const height = canvas.height;

      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, width, height);

      // Handle 15s Grace Period UI Render
      if (isGracePeriodRef.current) {
        setAttentionStatus(`⏳ SETUP GRACE PERIOD (${graceTimeLeft}s) - ALLOW CAMERA & SETTLE IN`);
        setHeadCentered(true);
        if (onEyeOffScreenStateChange) onEyeOffScreenStateChange(false);
        return;
      }

      let detectedFace = true;
      let headOnScreen = true;
      let secondaryDeviceDetected = false;

      // Frame Pixel Analysis: Head Centering, Rotation & Secondary Device Detection
      const frameData = ctx.getImageData(0, 0, width, height);
      const data = frameData.data;

      let totalLum = 0;
      let leftLum = 0;
      let rightLum = 0;
      let bottomLum = 0;
      let leftPixels = 0;
      let rightPixels = 0;
      let bottomPixels = 0;
      const midX = Math.floor(width / 2);
      const bottomY = Math.floor(height * 0.65);

      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
          const idx = (y * width + x) * 4;
          const lum = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
          totalLum += lum;

          if (x < midX) {
            leftLum += lum;
            leftPixels++;
          } else {
            rightLum += lum;
            rightPixels++;
          }

          if (y > bottomY) {
            bottomLum += lum;
            bottomPixels++;
          }
        }
      }

      const totalPixels = (width / 4) * (height / 4);
      const avgLum = totalLum / (totalPixels || 1);
      const avgLeft = leftLum / (leftPixels || 1);
      const avgRight = rightLum / (rightPixels || 1);
      const avgBottom = bottomLum / (bottomPixels || 1);

      // 1. Camera Covered / Dark Room Check
      if (avgLum < 10 || avgLum > 248) {
        detectedFace = false;
        headOnScreen = false;
      } else {
        detectedFace = true;
        // 2. Head Orientation / Turn Ratio (Left vs Right)
        const ratio = avgLeft / (avgRight || 1);
        if (ratio < 0.60 || ratio > 1.60) {
          headOnScreen = false; // Head turned away left/right
        } else {
          headOnScreen = true;
        }

        // 3. Secondary Device Detection (Phone / Mobile Glare Detection in Lower Quadrants)
        if (avgBottom > avgLum * 1.55 && avgBottom > 160) {
          secondaryDeviceDetected = true;
        }
      }

      // Native Browser FaceDetector API for precise Head Bounding Centering
      if ('FaceDetector' in window) {
        try {
          const detector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 2 });
          const faces = await detector.detect(video);
          if (faces && faces.length > 0) {
            detectedFace = true;
            if (faces.length > 1) {
              // Multiple faces detected (secondary person in frame)
              secondaryDeviceDetected = true;
            }
            const face = faces[0].boundingBox;
            const faceCenterX = face.x + face.width / 2;
            const isCenteredX = faceCenterX > video.videoWidth * 0.15 && faceCenterX < video.videoWidth * 0.85;
            if (!isCenteredX) headOnScreen = false;
          } else {
            detectedFace = false;
            headOnScreen = false;
          }
        } catch (e) {
          // Keep Canvas Head Position Result
        }
      }

      // Draw AI Head & Device Reticle Box
      ctx.clearRect(0, 0, width, height);

      // Head Target Box
      const boxWidth = width * 0.6;
      const boxHeight = height * 0.65;
      const boxX = (width - boxWidth) / 2;
      const boxY = (height - boxHeight) / 2;

      const isCompliant = headOnScreen && detectedFace && !secondaryDeviceDetected;
      ctx.strokeStyle = isCompliant ? '#10b981' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
      ctx.setLineDash([]);

      // Head Center Crosshair
      ctx.strokeStyle = isCompliant ? '#10b98188' : '#ef444488';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width / 2, boxY);
      ctx.lineTo(width / 2, boxY + boxHeight);
      ctx.moveTo(boxX, height / 2);
      ctx.lineTo(boxX + boxWidth, height / 2);
      ctx.stroke();

      // Head Position Dot
      const jitterX = isCompliant ? (Math.random() - 0.5) * 3 : (Math.random() - 0.5) * 16;
      const jitterY = isCompliant ? (Math.random() - 0.5) * 3 : (Math.random() - 0.5) * 16;
      ctx.fillStyle = isCompliant ? '#10b981' : '#ef4444';
      ctx.beginPath();
      ctx.arc(width / 2 + jitterX, height / 2 + jitterY, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Notify parent about screen red alert state
      if (onEyeOffScreenStateChange) {
        onEyeOffScreenStateChange(!isCompliant);
      }

      // Head & Secondary Device Violation Logic (~3.2 seconds debounce)
      if (!isCompliant) {
        violationTimerRef.current += 1;
        setHeadCentered(false);

        let statusText = '🔴 HEAD TURNED AWAY FROM EXAM SCREEN!';
        let violationReason = 'Candidate Head Turned Away from Screen';

        if (!detectedFace) {
          statusText = '🔴 NO HEAD/FACE DETECTED ON CAMERA!';
          violationReason = 'Candidate Head Absent / Camera Covered';
        } else if (secondaryDeviceDetected) {
          statusText = '📱 SECONDARY DEVICE / PHONE DETECTED!';
          violationReason = 'Secondary Device / Mobile Phone Detected in Camera Feed';
        }

        setAttentionStatus(statusText);

        if (violationTimerRef.current >= 4) {
          triggerSecurityViolation(violationReason);
          violationTimerRef.current = 0;
        }
      } else {
        violationTimerRef.current = 0;
        setHeadCentered(true);
        setAttentionStatus('🟢 HEAD CENTERED & DEVICE-FREE (FOCUSED)');
      }
    };

    const interval = setInterval(processFrame, 800);
    return () => clearInterval(interval);
  }, [isExamActive, cameraActive, onEyeOffScreenStateChange, graceTimeLeft]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl space-y-3 text-left">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <div className={`p-2 rounded-xl animate-pulse ${cameraActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            <FaUser className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
              <span>AI Head & Device Proctoring</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-black bg-red-600/80 text-white uppercase animate-pulse">
                <FaCircle className="w-1.5 h-1.5 mr-1 text-white animate-ping" /> REC
              </span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Live Head Pose & Mobile Device Detector Active
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

      {/* Grace Period Notification Banner */}
      {isGracePeriod && (
        <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-2 flex items-center justify-between text-amber-300 text-xs font-bold animate-pulse">
          <span className="flex items-center space-x-1.5 text-[11px]">
            <FaHourglassHalf className="w-3.5 h-3.5 animate-spin text-amber-400 flex-shrink-0" />
            <span>Setup Grace Period (Violations Paused)</span>
          </span>
          <span className="font-mono bg-amber-900/80 px-2 py-0.5 rounded text-[10px] border border-amber-500/40">
            {graceTimeLeft}s
          </span>
        </div>
      )}

      {/* Live Video Recording & AI Head Radar Section */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 items-center">
          {/* Permanent Live WebCam Camera Recording Feed Box */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video border border-slate-800 flex items-center justify-center group shadow-inner">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover transform scale-x-[-1] min-h-[90px]" 
            />
            <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-600/90 text-[8px] font-bold rounded uppercase tracking-wider text-white flex items-center space-x-1 shadow-md">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
              <span>HEAD & DEVICE CAM</span>
            </span>
            {!cameraActive && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-2 text-center text-[10px] text-slate-400">
                <FaVideo className="w-4 h-4 text-emerald-400 animate-pulse mb-1" />
                <span>Starting Camera...</span>
              </div>
            )}
          </div>

          {/* AI Head Radar Canvas Box */}
          <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video border border-slate-800 flex flex-col items-center justify-center p-1 shadow-inner">
            <canvas ref={canvasRef} width={140} height={90} className="w-full h-full min-h-[90px]" />
          </div>
        </div>

        {/* Head & Device Status Alert Card */}
        <div className={`p-2 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
          isGracePeriod 
            ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
            : (headCentered
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
                : 'bg-red-950/60 border-red-500/60 text-red-400 animate-pulse')
        }`}>
          <span className="flex items-center space-x-1.5 text-[11px]">
            {isGracePeriod ? <FaHourglassHalf className="w-3.5 h-3.5" /> : (headCentered ? <FaUserCheck className="w-3.5 h-3.5" /> : <FaUserSlash className="w-3.5 h-3.5" />)}
            <span className="truncate">{attentionStatus}</span>
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 flex-shrink-0">
            {isGracePeriod ? 'SETUP' : (headCentered ? 'VERIFIED' : 'VIOLATION')}
          </span>
        </div>
      </div>

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
          <FaMobileAlt className="w-2.5 h-2.5 text-blue-400" />
          <span>AI Head & Device Proctoring Active</span>
        </span>
        <span className={`font-bold ${violationCount > 0 ? 'text-red-400' : 'text-slate-300'}`}>
          Violations: {violationCount}/4
        </span>
      </div>
    </div>
  );
};

export default BiometricIntegrityRadar;
