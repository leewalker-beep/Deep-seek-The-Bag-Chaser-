import React from 'react';

interface EmptyStateProps {
  message: string;
  className?: string;
  paddingClass?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  className = '',
  paddingClass = 'py-12',
}) => {
  return (
    <div
      className={`text-center ${paddingClass} text-slate-600 text-sm italic border-2 border-dashed border-slate-800 rounded-2xl ${className}`}
    >
      {message}
    </div>
  );
};
