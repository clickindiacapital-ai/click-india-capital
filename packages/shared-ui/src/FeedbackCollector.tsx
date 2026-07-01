import React, { useState } from 'react';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, X } from 'lucide-react';

interface FeedbackCollectorProps {
  context: string;
  onClose: () => void;
  onSubmit: (data: { score: number; comment: string }) => void;
}

export const FeedbackCollector: React.FC<FeedbackCollectorProps> = ({ context, onClose, onSubmit }) => {
  const [score, setScore] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    onSubmit({ score, comment });
    setSubmitted(true);
    setTimeout(onClose, 2000);
  };

  if (submitted) {
    return (
      <div className="bg-[#0A111F] border border-emerald-500/30 p-6 rounded-3xl shadow-2xl animate-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
             <ThumbsUp size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Thank You!</h3>
          <p className="text-sm text-gray-400">Your feedback helps us build a more supportive ecosystem.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A111F] border border-white/5 p-8 rounded-3xl shadow-2xl max-w-sm relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
        <X size={18} />
      </button>

      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-1">How was your experience?</h3>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-widest italic">{context}</p>
      </div>

      <div className="flex justify-center gap-3 mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onClick={() => setScore(s)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
              score >= s ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/5 text-gray-500 hover:bg-white/10'
            }`}
          >
            <Star size={18} fill={score >= s ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>

      <div className="mb-8">
        <textarea
          placeholder="Anything we can improve? (Optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-gray-600 focus:ring-1 ring-blue-500 outline-none transition-all resize-none h-24"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={score === 0}
        className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
          score > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-white/5 text-gray-700 cursor-not-allowed'
        }`}
      >
        Submit Feedback
      </button>
    </div>
  );
};
