import React from 'react';

const Loader = ({ message = 'Processing request...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-3">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      {message && <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 animate-pulse">{message}</p>}
    </div>
  );
};

export default Loader;
