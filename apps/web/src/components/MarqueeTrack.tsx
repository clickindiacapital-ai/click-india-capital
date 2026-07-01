import React from 'react';

interface MarqueeTrackProps {
  items: string[];
}

export default function MarqueeTrack({ items }: MarqueeTrackProps) {
  // Duplicate items to ensure smooth infinite loop
  const duplicatedItems = [...items, ...items, ...items, ...items];

  return (
    <div className="relative w-full overflow-hidden bg-slate-950 border-y border-slate-900 py-4 select-none">
      {/* Inject custom styling for scrolling */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-track {
          display: inline-flex;
          animation: marquee 25s linear infinite;
        }
      `}</style>
      
      <div className="animate-marquee-track whitespace-nowrap flex items-center gap-12 text-slate-400 font-semibold tracking-wider text-xs uppercase">
        {duplicatedItems.map((item, index) => (
          <span key={index} className="flex items-center gap-3 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span>{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
