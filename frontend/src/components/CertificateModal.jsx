import React, { useRef, useState } from 'react';
import { FaTimes, FaDownload, FaAward, FaCheckCircle, FaShieldAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';

const CertificateModal = ({ isOpen, onClose, result, quiz, student, certificateId }) => {
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef(null);

  if (!isOpen || !result) return null;

  const handleDownloadPDF = async () => {
    setDownloading(true);
    const element = certRef.current;

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      // Capture visible DOM element with html2canvas
      const canvas = await html2canvas(element, {
        scale: 3, // High-resolution sharp text
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
      pdf.save(`Quizzy_Certificate_${certificateId || 'Official'}.pdf`);

      setDownloading(false);
      Swal.fire({
        title: 'Certificate Saved! 🎓',
        text: 'Your official PDF Certificate has been downloaded.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error('PDF Generation Error:', err);
      setDownloading(false);
      Swal.fire('Download Error', 'Could not generate PDF file. Please try again.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 space-y-6 shadow-2xl relative max-h-[95vh] overflow-y-auto">
        
        {/* Header Action Controls */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl">
              <FaAward className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Official Certificate Preview</h3>
              <p className="text-xs text-slate-400">Verified Credential issued by Quizzy Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs transition-all hover-scale shadow-lg shadow-amber-500/20 disabled:opacity-50"
            >
              <FaDownload />
              <span>{downloading ? 'Generating PDF...' : 'Download PDF Certificate'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas Box */}
        <div className="overflow-x-auto p-2 bg-slate-950 rounded-2xl flex justify-center">
          <div
            ref={certRef}
            className="w-[840px] h-[594px] bg-white text-slate-900 p-10 flex flex-col justify-between relative shadow-2xl box-border font-serif text-center"
            style={{
              border: '12px double #b45309',
              backgroundImage: 'radial-gradient(circle at center, #fefcf6 0%, #ffffff 100%)'
            }}
          >
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-600"></div>
            <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-600"></div>
            <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-600"></div>
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-600"></div>

            {/* Header Title */}
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-amber-700 tracking-widest uppercase font-serif">
                Certificate of Completion
              </h1>
              <p className="text-xs text-slate-500 italic">
                This credential is officially issued by Quizzy International Assessment Academy
              </p>
            </div>

            {/* Student & Quiz Details */}
            <div className="my-4 space-y-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">This is to certify that</p>
              <h2 className="text-3xl font-black text-blue-950 uppercase border-b-2 border-amber-600 inline-block px-8 pb-1">
                {student?.name || result?.studentId?.name || 'Verified Candidate'}
              </h2>
              <p className="text-xs text-slate-600 max-w-xl mx-auto leading-relaxed">
                has successfully passed the comprehensive assessment for <br />
                <strong className="text-slate-900 text-sm font-bold">"{quiz?.title || result?.quizId?.title}"</strong> <br />
                achieving a final score of <strong className="text-slate-900 font-bold">{result.score}</strong> points, representing a overall passing grade of <strong className="text-amber-700 font-black text-base">{result.percentage}%</strong>.
              </p>
            </div>

            {/* Badges & Trust Footer */}
            <div className="flex justify-between items-end px-6 pt-4 border-t border-slate-200">
              {/* Left Verification Metadata */}
              <div className="text-left space-y-1 text-[11px] text-slate-500">
                <p><strong>Verification ID:</strong> {certificateId || result.certificateId || 'CERT-QUIZZY-2026'}</p>
                <p><strong>Date Issued:</strong> {new Date(result.createdAt).toLocaleDateString()}</p>
                <p className="text-emerald-700 font-bold flex items-center space-x-1 mt-1">
                  <FaCheckCircle className="w-3 h-3" />
                  <span>AI Proctor Integrity: {result.integrityScore || 100}% Trust Rating</span>
                </p>
              </div>

              {/* Gold Seal Logo */}
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full border-4 border-amber-200 flex flex-col items-center justify-center text-white shadow-lg font-sans">
                <FaAward className="w-8 h-8 text-slate-950" />
                <span className="text-[8px] font-black text-slate-950 uppercase tracking-tighter mt-0.5">PASSED</span>
              </div>

              {/* Right Signature */}
              <div className="text-right space-y-1">
                <div className="font-serif italic text-lg font-bold text-blue-900 border-b border-slate-400 pb-1 px-4">
                  Assessment Committee
                </div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Quizzy Academic Director</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default CertificateModal;
