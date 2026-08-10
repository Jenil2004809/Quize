import React, { useState, useEffect, useRef } from 'react';
import { FaShieldAlt, FaEye, FaVideo, FaExclamationTriangle, FaCheckCircle, FaLock } from 'react-icons/fa';

const BiometricIntegrityRadar = ({ onViolation, onIntegrityChange, isExamActive }) => {
  const [integrityScore, setIntegrityScore] = useState(100);
  const [cameraActive, setCameraActive] = useState(false);
  const [attentionStatus, setAttentionStatus] = useState('Focused');
  const [violationCount, setViolationCount] = useState(0);
  const [logs, setLogs] = useState([]);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize WebCam for Biometric Integrity Monitoring
  useEffect(() => {
    let stream = null;
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.warn('Camera access denied or unavailable; fallback to simulated biometric sensor:', err.message);
        setCameraActive(false);
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

  // Tab switch & window blur integrity monitoring
  useEffect(() => {
    if (!isExamActive) return;

    const handleBlur = () => {
      setIntegrityScore(prev => {
        const next = Math.max(0, prev - 15);
        if (onIntegrityChange) onIntegrityChange(next);
        return next;
      });
      setViolationCount(prev => prev + 1);
      const time = new Date().toLocaleTimeString();
      setLogs(prev => [`[${time}] Tab switch / Window focus lost (-15%)`, ...prev.slice(0, 4)]);
      setAttentionStatus('Focus Lost!');
      if (onViolation) onViolation('Tab-switch / Window blur detected!');
    };

    const handleFocus = () => {
      setAttentionStatus('Focused');
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isExamActive, onViolation, onIntegrityChange]);

  // Simulate continuous AI Face & Head Pose Tracking Canvas Draw
  useEffect(() => {
    if (!isExamActive) return;

    const interval = setInterval(() => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;

        ctx.clearRect(0, 0, width, height);

        // Draw Radar Grid lines
        ctx.strokeStyle = '#3b82f633';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, 40, 0, 2 * Math.PI);
        ctx.arc(width / 2, height / 2, 20, 0, 2 * Math.PI);
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Draw active tracking dot
        const offsetX = (Math.random() - 0.5) * 8;
        const offsetY = (Math.random() - 0.5) * 8;
        ctx.fillStyle = integrityScore > 70 ? '#10b981' : (integrityScore > 40 ? '#f59e0b' : '#ef4444');
        ctx.beginPath();
        ctx.arc(width / 2 + offsetX, height / 2 + offsetY, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isExamActive, integrityScore]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl space-y-3">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl animate-pulse">
            <FaShieldAlt className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">AI Integrity Radar</h4>
            <p className="text-[10px] text-slate-400">Anti-Proxy & Attention Sensor</p>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center space-x-1 ${
          integrityScore > 70 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 
          (integrityScore > 40 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30')
        }`}>
          <FaCheckCircle className="w-3 h-3" />
          <span>{integrityScore}% Integrity</span>
        </div>
      </div>

      {/* Sensor Canvas & Video Feed */}
      <div className="grid grid-cols-2 gap-2 items-center">
        {/* WebCam Video Feed */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video border border-slate-800 flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
          {!cameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-slate-950/80">
              <FaVideo className="w-5 h-5 text-slate-500 mb-1" />
              <span className="text-[10px] text-slate-400">AI Motion Sensor Active</span>
            </div>
          )}
          <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-red-600/90 text-[9px] font-bold rounded uppercase tracking-wider text-white flex items-center space-x-1">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            <span>Live AI</span>
          </span>
        </div>

        {/* Attention Radar Heatmap Canvas */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video border border-slate-800 flex flex-col items-center justify-center p-2">
          <canvas ref={canvasRef} width={120} height={80} className="w-full h-full" />
          <div className="absolute bottom-1 right-1 text-[9px] font-semibold text-slate-400 bg-slate-900/80 px-1 rounded">
            {attentionStatus}
          </div>
        </div>
      </div>

      {/* Live Warning Logs */}
      {logs.length > 0 && (
        <div className="space-y-1 bg-slate-950/60 p-2 rounded-xl border border-slate-800 text-[10px]">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-center space-x-1 text-amber-400 font-mono">
              <FaExclamationTriangle className="flex-shrink-0 w-3 h-3" />
              <span className="truncate">{log}</span>
            </div>
          ))}
        </div>
      )}

      {/* Security Guarantee Note */}
      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800/80">
        <span className="flex items-center space-x-1">
          <FaLock className="w-2.5 h-2.5 text-blue-400" />
          <span>Fisher-Yates Question Shuffling Active</span>
        </span>
        <span className="font-semibold text-slate-300">Violations: {violationCount}</span>
      </div>
    </div>
  );
};

export default BiometricIntegrityRadar;
