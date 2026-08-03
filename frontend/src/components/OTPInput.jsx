import React, { useRef, useEffect } from 'react';

const OTPInput = ({ length = 6, value = '', onChange, disabled = false }) => {
  const inputRefs = useRef([]);

  // Split string into array of length
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  const handleChange = (e, index) => {
    const val = e.target.value;
    if (!/^[0-9]?$/.test(val)) return;

    const newDigits = [...digits];
    newDigits[index] = val;
    const newCombined = newDigits.join('');
    onChange(newCombined);

    // Auto-focus next input if value entered
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, length);
    if (/^\d+$/.test(pastedData)) {
      onChange(pastedData);
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-center items-center space-x-2 sm:space-x-3 my-4" onPaste={handlePaste}>
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-black rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
        />
      ))}
    </div>
  );
};

export default OTPInput;
