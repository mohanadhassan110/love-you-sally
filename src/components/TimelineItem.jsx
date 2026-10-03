import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Heart } from 'lucide-react';
import MediaViewer from './MediaViewer';

export default function TimelineItem({
  memory,
  index,
  isLeft,
  onOpenLightbox,
  onLike,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [justLiked, setJustLiked] = useState(false);

  // Normalize media items: support memory.media array or single memory.image
  const mediaItems = Array.isArray(memory.media) && memory.media.length > 0
    ? memory.media
    : memory.image
    ? [{ type: 'image', url: memory.image }]
    : [];

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

  const handleLikeClick = (e) => {
    e.stopPropagation();
    setJustLiked(true);
    setTimeout(() => setJustLiked(false), 800);
    onLike(memory.id);
  };

  const storyPreviewThreshold = 220;
  const isLongStory = memory.story && memory.story.length > storyPreviewThreshold;
  const displayStory =
    !isExpanded && isLongStory
      ? `${memory.story.slice(0, storyPreviewThreshold)}...`
      : memory.story;

  return (
    <div className="relative mb-8 sm:mb-14 md:mb-20 last:mb-0 w-full" dir="rtl">
      {/* Timeline Milestone Node (Sitting right on the vertical spine line on mobile & desktop) */}
      <div className="absolute right-4 sm:right-6 md:left-1/2 md:right-auto -translate-x-1/2 top-6 z-10 flex items-center justify-center">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#FAF7F2] border-2 border-[#C05665] shadow-xs flex items-center justify-center text-xs font-serif font-bold text-[#682535] bidi-text hover:scale-110 transition-transform">
          {index + 1}
        </div>
      </div>

      {/* Mobile connecting arm from right node to card */}
      <div
        className="block md:hidden absolute top-9.5 right-4 w-5 h-[1.5px] bg-[#C05665]/50 pointer-events-none"
        aria-hidden="true"
      />

      {/* Desktop connecting arm from central milestone node to the card */}
      <div
        className={`hidden md:block absolute top-10 h-[2px] w-7 pointer-events-none ${
          isLeft
            ? 'left-1/2 bg-gradient-to-l from-[#C89B53] to-transparent'
            : 'right-1/2 bg-gradient-to-r from-[#C89B53] to-transparent'
        }`}
        aria-hidden="true"
      />

      {/* Main Card Container */}
      <div
        className={`w-full pr-10 sm:pr-14 md:pr-0 md:w-[46%] ${
          isLeft ? 'md:ms-auto md:ps-6' : 'md:me-auto md:pe-6'
        }`}
      >
        <motion.article
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="group relative bg-white/95 rounded-3xl p-3.5 sm:p-5 border border-[#C89B53]/20 shadow-xs hover:shadow-md transition-all duration-300 w-full overflow-hidden"
        >
          {/* Prominent Media Display (Supports single photo, multiple photos slider, and video) */}
          <div className="mb-3.5 w-full">
            <MediaViewer
              media={mediaItems}
              alt={memory.story ? memory.story.slice(0, 30) : 'ذكرى جميلة'}
              onOpenLightbox={(items, currentIdx) =>
                onOpenLightbox(memory, items, currentIdx)
              }
            />
          </div>

          {/* Description Only (Pure emotional storytelling) */}
          {memory.story && (
            <div className="text-sm sm:text-base leading-relaxed text-[#4A3B43] px-1 sm:px-1.5 py-1">
              <p className="whitespace-pre-line font-normal">{displayStory}</p>
              {isLongStory && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-block text-xs font-bold text-[#C05665] hover:text-[#882B3B] underline underline-offset-4 transition-colors pt-1.5 cursor-pointer"
                >
                  {isExpanded ? 'عرض أقل' : 'اقرأ المزيد...'}
                </button>
              )}
            </div>
          )}

          {/* Card Footer: Date & Heart Reaction */}
          <div className="mt-3 pt-2.5 border-t border-[#F1D2D7]/50 flex items-center justify-between text-xs text-[#8B7B83] px-1">
            {memory.date ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-[#8B7B83] font-medium">
                <Calendar className="w-3.5 h-3.5 text-[#C05665]" />
                <span className="bidi-text">{formatDate(memory.date)}</span>
              </span>
            ) : (
              <span />
            )}

            {/* Like / Heart Reaction Button */}
            <button
              onClick={handleLikeClick}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                justLiked
                  ? 'bg-[#F8E9EB] scale-105 text-[#882B3B]'
                  : 'text-[#6B5C64] hover:text-[#C05665] hover:bg-[#FAF7F2]'
              }`}
              aria-label="إعجاب بهذه الذكرى"
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  justLiked || (memory.likes && memory.likes > 0)
                    ? 'fill-[#C05665] text-[#C05665]'
                    : 'text-[#8B7B83]'
                } ${justLiked ? 'scale-125' : ''}`}
              />
              <span className="bidi-text">{memory.likes || 0}</span>
            </button>
          </div>
        </motion.article>
      </div>
    </div>
  );
}
