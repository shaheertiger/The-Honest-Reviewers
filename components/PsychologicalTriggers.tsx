
import React, { useState, useEffect } from 'react';
import { Timer, Zap, Users, ShieldCheck } from 'lucide-react';

export const ScarcityBadge: React.FC<{ count: number }> = ({ count }) => (
  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wide border border-red-100">
    <Zap size={14} fill="currentColor" /> Only {count} Left in Stock!
  </div>
);

export const UrgencyTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(14400); // 4 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 14400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="bg-[#FF4500] text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 font-mono text-sm shadow-md animate-pulse">
      <Timer size={16} /> DEAL ENDS SOON: {formatTime(timeLeft)}
    </div>
  );
};

export const SocialProof: React.FC<{ users: string }> = ({ users }) => (
  <div className="flex items-center gap-2 text-gray-500 text-sm italic">
    <div className="flex -space-x-2">
      {[1,2,3,4].map(i => (
        <img key={i} src={`https://i.pravatar.cc/40?img=${i+10}`} className="w-6 h-6 rounded-full border-2 border-white" alt="User avatar" />
      ))}
    </div>
    <span>Join {users} others who chose this</span>
  </div>
);

export const TrustBadge: React.FC = () => (
  <div className="flex items-center gap-2 text-[#1E90FF] bg-[#1E90FF]/5 px-3 py-1.5 rounded-md border border-[#1E90FF]/10 font-bold text-xs uppercase tracking-tight">
    <ShieldCheck size={16} /> Expert Verified & Tested
  </div>
);
