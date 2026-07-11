import React from 'react';

const LoadingSkeleton = ({ type = 'card', count = 3 }) => {
  const items = Array(count).fill(0);

  if (type === 'table') {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-full"></div>
        {items.map((_, idx) => (
          <div key={idx} className="flex space-x-4">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3 animate-pulse">
        {items.map((_, idx) => (
          <div key={idx} className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg w-full"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((_, idx) => (
        <div key={idx} className="glass-card rounded-2xl p-6 space-y-4 animate-pulse">
          <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-xl w-full"></div>
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-3/4"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/2"></div>
          <div className="flex justify-between pt-2">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-20"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
