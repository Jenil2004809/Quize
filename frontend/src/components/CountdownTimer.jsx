import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ initialSeconds = 60, onExpire, resetTrigger }) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [resetTrigger, initialSeconds]);

  useEffect(() => {
    if (seconds <= 0) {
      if (onExpire) onExpire();
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, onExpire]);

  return (
    <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400 my-2">
      <span>Resend OTP in:</span>
      <span className={`px-2 py-0.5 rounded-md font-mono font-bold ${seconds > 0 ? 'bg-blue-500/10 text-blue-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
        {seconds > 0 ? `${seconds}s` : 'Expired'}
      </span>
    </div>
  );
};

export default CountdownTimer;
