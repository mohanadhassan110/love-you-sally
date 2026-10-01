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
          m.title.toLowerCase().includes(q) ||
          (m.story && m.story.toLowerCase().includes(q)) ||
          (m.tag && m.tag.toLowerCase().includes(q)) ||
          (m.location && m.location.toLowerCase().includes(q))
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
    <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24" dir="rtl">
      {/* Timeline Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-12 p-3 sm:p-4 rounded-3xl romantic-glass max-w-3xl mx-auto shadow-2xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute start-3.5 top-1/2 -translate-y-1/2 text-[#8B7B83]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في ذكرياتنا الجميلة..."
            className="w-full ps-10 pe-4 py-2 rounded-full text-xs bg-[#FAF7F2] border border-[#EADBCE] text-[#281C22] placeholder:text-[#8B7B83] focus:outline-hidden focus:border-[#C05665] transition-colors"
          />
        </div>

        {/* Filter Badges & Sort Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setFilterFavorite(!filterFavorite)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
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
            <span>المفضلة لقلبي</span>
          </button>

          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#6B5C64] hover:bg-[#FAF7F2] transition-colors"
            title="تبديل الترتيب الزمني"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{sortOrder === 'asc' ? 'الأقدم أولاً' : 'الأحدث أولاً'}</span>
          </button>
        </div>
      </div>

      {/* Vertical Spine Timeline Container */}
      <div className="relative">
        {/* Desktop Central Spine Line */}
        <div
          className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#E2C082] via-[#C89B53] to-[#E2C082]/30"
          aria-hidden="true"
        />

        {/* Mobile Right-aligned Spine Line (RTL) */}
        <div
          className="md:hidden absolute right-4 translate-x-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#E2C082] via-[#C89B53] to-[#E2C082]/30"
          aria-hidden="true"
        />

        {/* Timeline Memory Cards */}
        {processedMemories.length > 0 ? (
          <div>
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
          <div className="text-center py-16 px-4 bg-white/70 rounded-3xl border border-[#EADBCE] max-w-md mx-auto">
            <Sparkles className="w-8 h-8 text-[#C89B53] mx-auto mb-3" />
            <h3 className="text-xl font-serif text-[#281C22] mb-1">
              لم نعثر على ذكريات مطابقة
            </h3>
            <p className="text-xs text-[#8B7B83] mb-4">
              جرّب تغيير كلمات البحث أو إلغاء تصفية المفضلة لعرض المحطات.
            </p>
            {(searchQuery || filterFavorite) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setFilterFavorite(false);
                }}
                className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#F8E9EB] text-[#882B3B] hover:bg-[#F1D2D7] transition-colors"
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
