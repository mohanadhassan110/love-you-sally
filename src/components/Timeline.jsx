import React, { useState, useMemo } from 'react';
import TimelineItem from './TimelineItem';
import { Search, Heart, SlidersHorizontal, Sparkles } from 'lucide-react';

export default function Timeline({
  memories,
  onOpenLightbox,
  onLikeMemory,
}) {
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' = oldest first, 'desc' = newest first

  // Filter and sort memories
  const processedMemories = useMemo(() => {
    let result = [...memories];

    // Filter favorites
    if (filterFavorite) {
      result = result.filter((m) => m.isFavorite);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          (m.story && m.story.toLowerCase().includes(q)) ||
          (m.title && m.title.toLowerCase().includes(q))
      );
    }

    // Sort order
    result.sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [memories, filterFavorite, searchQuery, sortOrder]);

  return (
    <main className="relative max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 pb-20 w-full overflow-hidden" dir="rtl">
      {/* Timeline Controls & Filter Bar (Mobile-optimized) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-8 sm:mb-12 p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl romantic-glass max-w-2xl mx-auto shadow-2xs w-full">
        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-[#8B7B83]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في ذكرياتنا..."
            className="w-full ps-9 pe-3 py-1.5 rounded-full text-xs bg-[#FAF7F2] border border-[#EADBCE] text-[#281C22] placeholder:text-[#8B7B83] focus:outline-hidden focus:border-[#C05665] transition-colors"
          />
        </div>

        {/* Filter Badges & Sort Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setFilterFavorite(!filterFavorite)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              filterFavorite
                ? 'bg-[#F8E9EB] text-[#882B3B] border border-[#F1D2D7]'
                : 'text-[#6B5C64] hover:bg-[#FAF7F2]'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${
                filterFavorite ? 'fill-[#C05665] text-[#C05665]' : ''
              }`}
            />
            <span>المفضلة</span>
          </button>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#6B5C64] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
            title="تبديل الترتيب الزمني"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{sortOrder === 'asc' ? 'الأقدم أولاً' : 'الأحدث أولاً'}</span>
          </button>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="relative w-full">
        {/* Romantic Spine Line (Visible on both mobile & desktop) */}
        {processedMemories.length > 0 && (
          <>
            {/* Top Heart Node */}
            <div
              className="absolute -top-3 right-4 sm:right-6 md:left-1/2 md:right-auto -translate-x-1/2 z-20 w-7 h-7 rounded-full bg-[#FAF7F2] border-2 border-[#C05665] flex items-center justify-center text-[#C05665] shadow-xs"
              title="بداية رحلتنا"
            >
              <Heart className="w-3.5 h-3.5 fill-[#C05665]" />
            </div>

            {/* Continuous Vertical Gradient Spine */}
            <div
              className="absolute top-2 bottom-4 right-4 sm:right-6 md:left-1/2 md:right-auto -translate-x-1/2 w-[2px] bg-gradient-to-b from-[#C05665] via-[#E2C082] to-[#C89B53]/40"
              aria-hidden="true"
            />

            {/* Bottom Sparkle Node */}
            <div
              className="absolute -bottom-3 right-4 sm:right-6 md:left-1/2 md:right-auto -translate-x-1/2 z-20 w-6 h-6 rounded-full bg-[#FAF7F2] border-2 border-[#C89B53] flex items-center justify-center text-[#C89B53] shadow-xs"
              title="قصتنا مستمرة إلى الأبد"
            >
              <Sparkles className="w-3 h-3" />
            </div>
          </>
        )}

        {/* Timeline Memory Cards */}
        {processedMemories.length > 0 ? (
          <div className="w-full">
            {processedMemories.map((memory, index) => (
              <TimelineItem
                key={memory.id}
                memory={memory}
                index={index}
                isLeft={index % 2 === 0}
                onOpenLightbox={onOpenLightbox}
                onLike={onLikeMemory}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="text-center py-12 px-4 bg-white/70 rounded-3xl border border-[#EADBCE] max-w-md mx-auto">
            <Sparkles className="w-8 h-8 text-[#C89B53] mx-auto mb-3" />
            <h3 className="text-lg font-serif font-bold text-[#281C22] mb-1">
              لم نعثر على ذكريات مطابقة
            </h3>
            <p className="text-xs text-[#8B7B83] mb-4">
              جرّب تغيير كلمات البحث أو إلغاء تصفية المفضلة.
            </p>
            {(searchQuery || filterFavorite) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterFavorite(false);
                }}
                className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#F8E9EB] text-[#882B3B] hover:bg-[#F1D2D7] transition-colors cursor-pointer"
              >
                إلغاء التصفية
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
