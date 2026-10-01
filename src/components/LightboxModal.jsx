import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, MapPin, Tag } from 'lucide-react';

export default function LightboxModal({
  memory,
  memories,
  onClose,
  onNavigate,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate('next');
      if (e.key === 'ArrowRight') onNavigate('prev');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate]);

  if (!memory) return null;

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ar-EG', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={memory.title}
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md transition-opacity duration-300"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 start-4 z-50 p-2.5 rounded-full bg-white/20 hover:bg-white/35 text-white transition-all cursor-pointer"
        aria-label="إغلاق المعاينة"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Prev button */}
      {memories.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('prev');
          }}
          className="absolute end-3 sm:end-6 top-1/2 -translate-y-1/2 z-50 p-2.5 sm:p-3 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer"
          aria-label="الذكرى السابقة"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Next button */}
      {memories.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('next');
          }}
          className="absolute start-3 sm:start-6 top-1/2 -translate-y-1/2 z-50 p-2.5 sm:p-3 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer"
          aria-label="الذكرى التالية"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {/* Content Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl w-full max-h-[92vh] flex flex-col md:flex-row bg-[#FAF7F2] rounded-3xl overflow-hidden shadow-2xl border border-[#C89B53]/30 text-right"
      >
        {/* Photo Container */}
        <div className="relative md:w-3/5 bg-black flex items-center justify-center min-h-[260px] max-h-[50vh] md:max-h-[85vh]">
          <img
            src={memory.image}
            alt={memory.title}
            className="w-full h-full object-contain md:object-cover"
          />
        </div>

        {/* Story Details Sidebar */}
        <div className="md:w-2/5 p-5 sm:p-6 flex flex-col justify-between overflow-y-auto max-h-[40vh] md:max-h-[85vh]">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#F8E9EB] text-[#882B3B] text-[11px] font-bold">
                محطة <span className="bidi-text">#{memory.milestone || '01'}</span>
              </span>
              {memory.tag && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[#6B5C64]">
                  <Tag className="w-3 h-3 text-[#C05665]" />
                  <span>{memory.tag}</span>
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-medium text-[#281C22] leading-tight">
              {memory.title}
            </h2>

            <div className="flex flex-col gap-1.5 text-xs text-[#8B7B83] border-b border-[#EADBCE] pb-3">
              {memory.date && (
                <span className="inline-flex items-center gap-1.5 font-medium text-[#682535]">
                  <Calendar className="w-3.5 h-3.5 text-[#C05665]" />
                  <span className="bidi-text">{formatDate(memory.date)}</span>
                </span>
              )}
              {memory.location && (
                <span className="inline-flex items-center gap-1.5 text-[#6B5C64]">
                  <MapPin className="w-3.5 h-3.5 text-[#C89B53]" />
                  <span>{memory.location}</span>
                </span>
              )}
            </div>

            <div className="text-sm leading-relaxed text-[#5F4F57] pt-2">
              <p className="whitespace-pre-line">{memory.story}</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#EADBCE] text-start">
            <span className="text-xs font-serif text-[#C05665] italic">
              محفورة دائماً في أعماق قلبي
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
