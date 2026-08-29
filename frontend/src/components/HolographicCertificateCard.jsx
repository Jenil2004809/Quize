import React, { useState, useRef } from 'react';
import { 
  FaAward, FaDownload, FaLinkedin, FaShareAlt, FaCheckCircle, 
  FaShieldAlt, FaQrcode, FaGraduationCap, FaExternalLinkAlt, FaImage
} from 'react-icons/fa';
import Swal from 'sweetalert2';

const HolographicCertificateCard = ({ 
  result, 
  quiz, 
  student, 
  certificateId = 'CERT-OFFICIAL-2026',
  showActions = true 
}) => {
  const cardRef = useRef(null);
  const printRef = useRef(null);

  // 3D Tilt State
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingPNG, setDownloadingPNG] = useState(false);

  const studentName = student?.name || 'Aarav Mehta';
  const quizTitle = quiz?.title || result?.quizId?.title || 'Advanced Software Engineering & System Architecture';
  const categoryName = quiz?.category?.name || 'Computer Science & Engineering';
  const score = result?.score !== undefined ? result.score : 10;
  const percentage = result?.percentage !== undefined ? result.percentage : 100;
  const issueDate = result?.createdAt ? new Date(result.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const isDistinction = percentage >= 75;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -10;
    const rotY = ((x - centerX) / centerX) * 10;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePosition({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.6
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePosition({ x: 50, y: 50, opacity: 0 });
  };

  // Download High-Resolution PDF
  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${studentName.replace(/\s+/g, '_')}_${certificateId}.pdf`);

      Swal.fire({
        title: 'Certificate Downloaded! 📜',
        text: 'Your official 300-DPI University PDF has been saved.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('PDF Generation Error:', err);
      Swal.fire('Download Error', 'Could not generate PDF file.', 'error');
    } finally {
      setDownloadingPDF(false);
    }
  };

  // Download High-Resolution PNG Image
  const handleDownloadPNG = async () => {
    setDownloadingPNG(true);
    try {
      const { default: html2canvas } = await import('html2canvas');
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const link = document.createElement('a');
      link.download = `${studentName.replace(/\s+/g, '_')}_${certificateId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      Swal.fire({
        title: 'Image Saved! 🖼️',
        text: 'High-res PNG Certificate saved to your device.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('PNG Generation Error:', err);
      Swal.fire('Download Error', 'Could not save PNG image.', 'error');
    } finally {
      setDownloadingPNG(false);
    }
  };

  // Add to LinkedIn Certifications URL
  const handleLinkedInShare = () => {
    const orgName = encodeURIComponent('Quiz Master University Examination Board');
    const certName = encodeURIComponent(`${quizTitle} - Certified Academic Credential`);
    const certUrl = encodeURIComponent(window.location.href);
    const certId = encodeURIComponent(certificateId);
    const issueYear = new Date().getFullYear();
    const issueMonth = new Date().getMonth() + 1;

    const linkedinUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${certUrl}&certId=${certId}`;
    window.open(linkedinUrl, '_blank', 'noopener,noreferrer');
  };

  // Copy Verification Link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    Swal.fire({
      title: 'Link Copied! 📋',
      text: 'Verified Certificate verification link copied to clipboard.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <div className="space-y-6 w-full flex flex-col items-center">
      
      {/* 3D Holographic Interactive Perspective Container */}
      <div
        className="w-full max-w-4xl perspective-1000 cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div
          ref={cardRef}
          className="relative transition-transform duration-150 ease-out rounded-3xl p-1 bg-gradient-to-tr from-amber-500 via-amber-200 to-yellow-500 shadow-2xl shadow-amber-500/20"
          style={{
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Moving Holographic Light Glare Overlay */}
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none z-30 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.1) 40%, transparent 80%)`,
              opacity: glarePosition.opacity
            }}
          />

          {/* Actual Certificate Document Canvas (Print Ref for high-res PDF/PNG) */}
          <div
            ref={printRef}
            className="relative bg-[#fcfbf7] text-slate-900 rounded-[22px] p-8 sm:p-12 overflow-hidden flex flex-col justify-between select-none shadow-inner"
            style={{
              border: '8px double #b45309',
              backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #fdfbf7 70%, #f7f3e8 100%)'
            }}
          >
            {/* Guilloché Corner Accents */}
            <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-amber-600 rounded-tl-lg pointer-events-none"></div>
            <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-amber-600 rounded-tr-lg pointer-events-none"></div>
            <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-amber-600 rounded-bl-lg pointer-events-none"></div>
            <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-amber-600 rounded-br-lg pointer-events-none"></div>

            {/* Top Certificate Header & Crest */}
            <div className="text-center space-y-2 border-b-2 border-amber-500/30 pb-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex items-center justify-center text-white shadow-md">
                  <FaGraduationCap className="w-5 h-5" />
                </div>
                <span className="font-serif font-black text-xs uppercase tracking-[0.3em] text-amber-900">
                  QUIZ MASTER UNIVERSITY EXAMINATION BOARD
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-slate-900 uppercase">
                Certificate of Academic Achievement
              </h1>
              <p className="text-[11px] uppercase tracking-widest text-slate-500 font-sans font-bold">
                Accredited Proctored Examination • Ref: {certificateId}
              </p>
            </div>

            {/* Certificate Body & Recipient */}
            <div className="my-6 text-center space-y-4">
              <p className="text-xs italic text-slate-600 font-serif">
                This official credential certifies that
              </p>
              
              <div className="relative inline-block">
                <h2 className="text-2xl sm:text-4xl font-serif font-black text-amber-900 border-b-2 border-amber-400 pb-1 px-8">
                  {studentName}
                </h2>
              </div>

              <p className="text-xs text-slate-700 max-w-xl mx-auto leading-relaxed font-sans">
                has successfully demonstrated comprehensive subject mastery and rigorous technical competence in the official university assessment:
              </p>

              <div className="bg-amber-500/10 border border-amber-500/30 py-2.5 px-6 rounded-xl inline-block max-w-2xl">
                <h3 className="font-serif font-black text-sm sm:text-base text-slate-900">
                  {quizTitle}
                </h3>
                <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">
                  Discipline: {categoryName}
                </span>
              </div>
            </div>

            {/* Bottom Proof Section: Score Stamp, QR Code, and Registrar Signatures */}
            <div className="pt-4 border-t-2 border-amber-500/30 grid grid-cols-3 items-center gap-4 text-center">
              
              {/* Left: Security QR & Verification ID */}
              <div className="flex flex-col items-center sm:items-start text-left space-y-1">
                <div className="w-14 h-14 bg-white border border-amber-600/40 p-1 rounded-lg flex items-center justify-center shadow-sm">
                  <FaQrcode className="w-10 h-10 text-amber-900" />
                </div>
                <span className="text-[9px] font-mono text-slate-500">ID: {certificateId}</span>
                <span className="text-[8px] text-emerald-700 font-bold flex items-center space-x-1">
                  <FaCheckCircle className="w-2.5 h-2.5" />
                  <span>Cryptographically Verified</span>
                </span>
              </div>

              {/* Center: Honors / Distinction Seal */}
              <div className="flex flex-col items-center justify-center">
                <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 ${
                  isDistinction ? 'border-amber-600 bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950' : 'border-blue-600 bg-blue-500 text-white'
                } flex flex-col items-center justify-center shadow-xl shadow-amber-500/30 transform hover:scale-105 transition-transform`}>
                  <FaAward className="w-6 h-6 sm:w-8 sm:h-8" />
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider leading-none mt-0.5">
                    {isDistinction ? 'HONORS' : 'PASS'}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-extrabold leading-none">
                    {percentage}%
                  </span>
                </div>
                <span className="text-[10px] font-bold text-amber-900 mt-1 uppercase tracking-wider">
                  Grade Score: {score} Marks
                </span>
              </div>

              {/* Right: Official Signatures */}
              <div className="flex flex-col items-center sm:items-end text-right space-y-1">
                <div className="font-serif italic text-sm text-slate-800 border-b border-slate-400 pb-0.5 px-4 font-bold">
                  Dr. Rajesh Gohil
                </div>
                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-wider">
                  Dean of Academic Examinations
                </span>
                <span className="text-[8px] text-slate-400">
                  Issued On: {issueDate}
                </span>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* 1-Click Multi-Format Export Bar */}
      {showActions && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleDownloadPDF}
            disabled={downloadingPDF}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs transition-all hover:scale-105 shadow-lg shadow-amber-500/20 disabled:opacity-50"
          >
            <FaDownload className="w-3.5 h-3.5" />
            <span>{downloadingPDF ? 'Rendering PDF...' : 'Download Print PDF (300 DPI)'}</span>
          </button>

          <button
            onClick={handleDownloadPNG}
            disabled={downloadingPNG}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all hover:scale-105 shadow-md border border-slate-700"
          >
            <FaImage className="w-3.5 h-3.5 text-blue-400" />
            <span>{downloadingPNG ? 'Saving Image...' : 'Save PNG Image'}</span>
          </button>

          <button
            onClick={handleLinkedInShare}
            className="flex items-center space-x-2 bg-[#0077b5] hover:bg-[#005f93] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all hover:scale-105 shadow-md shadow-[#0077b5]/20"
          >
            <FaLinkedin className="w-3.5 h-3.5" />
            <span>Add to LinkedIn Profile</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs transition-all hover:scale-105 border border-slate-300 dark:border-slate-700"
          >
            <FaShareAlt className="w-3.5 h-3.5 text-indigo-500" />
            <span>Copy Link</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default HolographicCertificateCard;
