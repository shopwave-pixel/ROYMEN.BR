import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  fullScreen?: boolean;
  message?: string;
}

export const Loader: React.FC<LoaderProps> = ({ fullScreen = false, message = 'Loading premium styles...' }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="relative flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#D4AF37] animate-spin" />
        <span className="absolute text-[10px] text-[#D4AF37] font-mono tracking-tight font-extrabold uppercase">ROY</span>
      </div>
      <p className="text-xs text-slate-400 font-mono tracking-widest">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#0F111A]/95 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
