import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Image as ImageIcon, Video as VideoIcon, Maximize2 } from 'lucide-react';

export default function MediaViewer({ media = [], alt = '', onOpenLightbox }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Normalize media items (handles legacy string 'image' or 'media' array)
  const items = Array.isArray(media) && media.length > 0
    ? media
    : [{ type: 'image', url: media }];

  const currentItem = items[currentIndex] || items[0];
  const isVideo = currentItem?.type === 'video' || (typeof currentItem?.url === 'string' && currentItem.url.match(/\.(mp4|webm|mov|ogg)$/i));

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    setIsPlaying(false);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    setIsPlaying(false);
  };

  return (
    <div
      onClick={() => onOpenLightbox && onOpenLightbox(items, currentIndex)}
      className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer bg-[#22181C] group select-none shadow-2xs"
    >
      {/* Media item rendering */}
      {isVideo ? (
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          <video
            src={currentItem.url}
            playsInline
            controls
            preload="metadata"
            className="w-full h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : (
        <img
          src={currentItem.url}
          alt={alt || 'ذكرى جميلة'}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}

      {/* Overlay gradient */}
      {!isVideo && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      {/* Multiple media counter indicator badge */}
      {items.length > 1 && (
        <div
          className="absolute top-3 start-3 z-10 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium flex items-center gap-1.5 shadow-xs bidi-text"
          dir="ltr"
        >
          {isVideo ? (
            <VideoIcon className="w-3 h-3 text-[#E2C082]" />
          ) : (
            <ImageIcon className="w-3 h-3 text-[#E2C082]" />
          )}
          <span>
            {currentIndex + 1} / {items.length}
          </span>
        </div>
      )}

      {/* Enlarge click affordance icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onOpenLightbox && onOpenLightbox(items, currentIndex);
        }}
        className="absolute bottom-3 start-3 z-10 p-2 rounded-full bg-white/85 text-[#281C22] opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white shadow-xs cursor-pointer"
        aria-label="عرض بملء الشاشة"
      >
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* Navigation Arrows for Multiple Media */}
      {items.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute end-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
            aria-label="العنصر السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute start-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
            aria-label="العنصر التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 inset-x-0 z-10 flex justify-center items-center gap-1.5 pointer-events-none">
            {items.map((_, dotIdx) => (
              <div
                key={dotIdx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  dotIdx === currentIndex
                    ? 'w-5 bg-white shadow-xs'
                    : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
