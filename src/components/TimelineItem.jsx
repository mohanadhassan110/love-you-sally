import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Heart, Maximize2, Tag, Star } from 'lucide-react';

export default function TimelineItem({
  memory,
  index,
  isLeft,
  onOpenLightbox,
  onLike,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [justLiked, setJustLiked] = useState(false);

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

  const storyPreviewThreshold = 180;
  const isLongStory = memory.story && memory.story.length > storyPreviewThreshold;
  const displayStory =
    !isExpanded && isLongStory
      ? `${memory.story.slice(0, storyPreviewThreshold)}...`
      : memory.story;

  return (
    <div className="relative mb-12 sm:mb-16 md:mb-24 last:mb-0" dir="rtl">
      {/* Central Timeline Milestone Node (Desktop) */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-6 z-10 items-center justify-center">
        <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border-2 border-[#C89B53] shadow-md flex items-center justify-center text-xs font-serif font-bold text-[#682535] bidi-text">
          {memory.milestone || (index + 1).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Right-Aligned Milestone Node (Mobile RTL) */}
      <div className="md:hidden absolute right-4 translate-x-1/2 top-4 z-10 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border-2 border-[#C89B53] shadow-xs flex items-center justify-center text-[11px] font-serif font-bold text-[#682535] bidi-text">
          {memory.milestone || (index + 1).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Main Card Container */}
      <div
        className={`md:w-[46%] ${
          isLeft ? 'md:ms-auto md:ps-4' : 'md:me-auto md:pe-4'
        } pr-10 md:pr-0`}
      >
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="group relative bg-white/95 rounded-3xl p-4 sm:p-5 border border-[#C89B53]/20 shadow-xs hover:shadow-md transition-all duration-300"
        >
          {/* Favorite Badge */}
          {memory.isFavorite && (
            <div
              className="absolute -top-2.5 start-6 z-10 px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#C89B53] text-[#A17531] text-[11px] font-semibold flex items-center gap-1 shadow-2xs"
              title="محطة مميزة في قلوبنا"
            >
              <Star className="w-3 h-3 fill-[#C89B53] text-[#C89B53]" />
              <span>مفضلة لقلبي</span>
            </div>
          )}

          {/* Prominent High-Quality Memory Photo */}
          <div
            onClick={() => onOpenLightbox(memory)}
            className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer bg-[#F5EFEB] mb-4 group/photo shadow-2xs"
          >
            <img
              src={memory.image}
              alt={memory.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/photo:scale-105"
            />
            {/* Soft subtle gradient overlay at bottom of photo */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300" />
            
            {/* Enlarge click affordance icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenLightbox(memory);
              }}
              className="absolute bottom-3 start-3 p-2 rounded-full bg-white/85 text-[#281C22] opacity-0 group-hover/photo:opacity-100 transition-opacity duration-200 hover:bg-white shadow-xs"
              aria-label="تكبير الصورة"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Meta Details Bar (Date, Tag, Location) */}
          <div className="flex flex-wrap items-center gap-2 mb-2.5 text-xs text-[#8B7B83]">
            {memory.date && (
              <span className="inline-flex items-center gap-1 font-medium text-[#682535]">
                <Calendar className="w-3.5 h-3.5 text-[#C05665]" />
                <span className="bidi-text">{formatDate(memory.date)}</span>
              </span>
            )}

            {memory.tag && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F8E9EB] text-[#882B3B] font-medium text-[11px]">
                <Tag className="w-2.5 h-2.5" />
                <span>{memory.tag}</span>
              </span>
            )}

            {memory.location && (
              <span className="inline-flex items-center gap-1 ms-auto text-[11px] text-[#8B7B83]">
                <MapPin className="w-3 h-3 text-[#C89B53]" />
                <span>{memory.location}</span>
              </span>
            )}
          </div>

          {/* Memory Title */}
          <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#281C22] tracking-tight mb-2 leading-snug">
            {memory.title}
          </h2>

          {/* Emotional Story Narrative */}
          <div className="text-sm leading-relaxed text-[#5F4F57] space-y-2">
            <p className="whitespace-pre-line">{displayStory}</p>
            {isLongStory && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-block text-xs font-semibold text-[#C05665] hover:text-[#882B3B] underline underline-offset-4 transition-colors pt-1 cursor-pointer"
              >
                {isExpanded ? 'عرض أقل' : 'اقرأ القصة كاملة...'}
              </button>
            )}
          </div>

          {/* Card Footer: Heart Reaction & Milestone Indicator */}
          <div className="mt-4 pt-3 border-t border-[#F1D2D7]/50 flex items-center justify-between">
            <div className="text-[12px] font-serif text-[#8B7B83]">
              محطة <span className="font-bold text-[#682535] bidi-text">#{memory.milestone || (index + 1).toString().padStart(2, '0')}</span>
            </div>

            {/* Like / Heart Reaction Button */}
            <button
              onClick={handleLikeClick}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                justLiked
                  ? 'bg-[#F8E9EB] scale-105 text-[#882B3B]'
                  : 'text-[#6B5C64] hover:text-[#C05665] hover:bg-[#FAF7F2]'
              }`}
              aria-label={`إعجاب بالذكرى ${memory.title}`}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-transform ${
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
