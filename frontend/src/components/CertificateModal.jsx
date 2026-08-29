import React from 'react';
import { FaTimes, FaAward } from 'react-icons/fa';
import HolographicCertificateCard from './HolographicCertificateCard';

const CertificateModal = ({ isOpen, onClose, result, quiz, student, certificateId }) => {
  if (!isOpen || !result) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[95vh] overflow-y-auto custom-scrollbar">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3 text-left">
            <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-2xl">
              <FaAward className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Official University Credential</h3>
              <p className="text-xs text-slate-400">Interactive 3D Holographic Certificate with Cryptographic Verification</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
            title="Close Preview"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* 3D Holographic Interactive Certificate Display */}
        <div className="py-2">
          <HolographicCertificateCard
            result={result}
            quiz={quiz}
            student={student}
            certificateId={certificateId}
            showActions={true}
          />
        </div>

      </div>
    </div>
  );
};

export default CertificateModal;
