import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Calendar, Video as VideoIcon, Image as ImageIcon } from 'lucide-react';

export default function LightboxModal({
  memory,
  memories = [],
  initialMediaIndex = 0,
  onClose,
  onNavigate,
}) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(initialMediaIndex);

  // Normalize media items
  const mediaItems = React.useMemo(() => {
    if (!memory) return [];
    if (Array.isArray(memory.media) && memory.media.length > 0) {
      return memory.media;
    }
    if (memory.image) {
      return [{ type: 'image', url: memory.image }];
    }
    return [];
  }, [memory]);

  useEffect(() => {
    setCurrentMediaIndex(initialMediaIndex || 0);
  }, [memory, initialMediaIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') {
        if (mediaItems.length > 1 && currentMediaIndex < mediaItems.length - 1) {
          setCurrentMediaIndex((prev) => prev + 1);
        } else if (onNavigate) {
          onNavigate('next');
        }
      }
      if (e.key === 'ArrowRight') {
        if (mediaItems.length > 1 && currentMediaIndex > 0) {
          setCurrentMediaIndex((prev) => prev - 1);
        } else if (onNavigate) {
          onNavigate('prev');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigate, mediaItems.length, currentMediaIndex]);

  if (!memory) return null;

  const currentMedia = mediaItems[currentMediaIndex] || mediaItems[0] || null;
  const isVideo =
    currentMedia?.type === 'video' ||
    (typeof currentMedia?.url === 'string' &&
      currentMedia.url.match(/\.(mp4|webm|mov|ogg)$/i));

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

  const handleNextMedia = (e) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
  };

  const handlePrevMedia = (e) => {
    e.stopPropagation();
    setCurrentMediaIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md transition-opacity duration-300 overflow-y-auto"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-3 start-3 sm:top-5 sm:start-5 z-50 p-2.5 rounded-full bg-white/20 hover:bg-white/35 text-white transition-all cursor-pointer shadow-md"
        aria-label="إغلاق المعاينة"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Memory-level Navigation (Prev Memory) */}
      {memories.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('prev');
          }}
          className="hidden sm:flex fixed end-3 sm:end-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all cursor-pointer border border-white/20"
          aria-label="الذكرى السابقة"
          title="الذكرى السابقة"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Memory-level Navigation (Next Memory) */}
      {memories.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNavigate('next');
          }}
          className="hidden sm:flex fixed start-3 sm:start-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all cursor-pointer border border-white/20"
          aria-label="الذكرى التالية"
          title="الذكرى التالية"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Content Card: Media + Description Only */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl w-full flex flex-col bg-[#FAF7F2] rounded-3xl overflow-hidden shadow-2xl border border-[#C89B53]/30 my-auto text-right max-h-[92vh]"
      >
        {/* Media Container */}
        <div className="relative w-full bg-black flex items-center justify-center min-h-[220px] max-h-[58vh] sm:max-h-[64vh] overflow-hidden select-none">
          {currentMedia ? (
            isVideo ? (
              <video
                key={currentMedia.url}
                src={currentMedia.url}
                controls
                autoPlay
                playsInline
                className="w-full h-full max-h-[58vh] sm:max-h-[64vh] object-contain"
              />
            ) : (
              <img
                key={currentMedia.url}
                src={currentMedia.url}
                alt={memory.story ? memory.story.slice(0, 30) : 'معاينة الذكرى'}
                className="w-full h-full max-h-[58vh] sm:max-h-[64vh] object-contain"
              />
            )
          ) : (
            <div className="text-white/60 p-8 text-center text-sm">
              لا توجد وسائط لهذه الذكرى
            </div>
          )}

          {/* Multiple Media Badge */}
          {mediaItems.length > 1 && (
            <div
              className="absolute top-3 end-3 z-20 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-xs font-medium flex items-center gap-1.5 border border-white/20"
              dir="ltr"
            >
              {isVideo ? (
                <VideoIcon className="w-3.5 h-3.5 text-[#E2C082]" />
              ) : (
                <ImageIcon className="w-3.5 h-3.5 text-[#E2C082]" />
              )}
              <span>
                {currentMediaIndex + 1} / {mediaItems.length}
              </span>
            </div>
          )}

          {/* Internal media carousel navigation */}
          {mediaItems.length > 1 && (
            <>
              <button
                onClick={handlePrevMedia}
                className="absolute end-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer"
                aria-label="الوسيط السابق"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMedia}
                className="absolute start-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all cursor-pointer"
                aria-label="الوسيط التالي"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-2.5 inset-x-0 z-20 flex justify-center items-center gap-1.5 pointer-events-none">
                {mediaItems.map((_, dotIdx) => (
                  <div
                    key={dotIdx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      dotIdx === currentMediaIndex
                        ? 'w-6 bg-white shadow-xs'
                        : 'w-1.5 bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Description Only Section */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[34vh] flex flex-col justify-between bg-[#FAF7F2]">
          {/* Story / Description text */}
          {memory.story ? (
            <p className="text-sm sm:text-base leading-relaxed text-[#281C22] whitespace-pre-line font-normal">
              {memory.story}
            </p>
          ) : (
            <p className="text-sm italic text-[#8B7B83]">
              لحظة دافئة محفورة في القلب دون كلمات...
            </p>
          )}

          {/* Subtle Date & Navigation Footer */}
          <div className="mt-4 pt-3 border-t border-[#EADBCE] flex items-center justify-between text-xs text-[#8B7B83]">
            {memory.date ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-[#682535]">
                <Calendar className="w-3.5 h-3.5 text-[#C05665]" />
                <span className="bidi-text">{formatDate(memory.date)}</span>
              </span>
            ) : (
              <span />
            )}

            {/* Mobile Memory Switchers */}
            {memories.length > 1 && (
              <div className="flex sm:hidden items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('prev');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#EADBCE] text-[11px] text-[#682535]"
                >
                  السابقة
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('next');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#EADBCE] text-[11px] text-[#682535]"
                >
                  التالية
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
