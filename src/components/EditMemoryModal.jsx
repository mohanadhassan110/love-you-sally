import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Video as VideoIcon, Image as ImageIcon, Star } from 'lucide-react';
import { processMediaFile } from '../utils/imageCompressor';

export default function EditMemoryModal({ memory, isOpen, onClose, onSave }) {
  // Normalize initial media items from memory
  const initialMedia = React.useMemo(() => {
    if (!memory) return [];
    if (Array.isArray(memory.media) && memory.media.length > 0) {
      return [...memory.media];
    }
    if (memory.image) {
      return [{ type: 'image', url: memory.image }];
    }
    return [];
  }, [memory]);

  const [mediaList, setMediaList] = useState(initialMedia);
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState('image'); // 'image' | 'video'
  const [story, setStory] = useState(memory?.story || '');
  const [date, setDate] = useState(memory?.date || '');
  const [isFavorite, setIsFavorite] = useState(!!memory?.isFavorite);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Re-sync if memory changes
  React.useEffect(() => {
    if (memory) {
      const items = Array.isArray(memory.media) && memory.media.length > 0
        ? [...memory.media]
        : memory.image
        ? [{ type: 'image', url: memory.image }]
        : [];
      setMediaList(items);
      setStory(memory.story || '');
      setDate(memory.date || '');
      setIsFavorite(!!memory.isFavorite);
      setErrorMsg('');
    }
  }, [memory]);

  if (!isOpen || !memory) return null;

  // Handle uploading multiple files (images and/or videos)
  const handleMultipleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsProcessing(true);
    setErrorMsg('');

    try {
      const newItems = [];
      for (const file of files) {
        try {
          const item = await processMediaFile(file);
          newItems.push(item);
        } catch (itemErr) {
          console.warn('Error processing file:', file.name, itemErr);
          setErrorMsg(itemErr.message || 'حدث خطأ في أحد الملفات.');
        }
      }
      if (newItems.length > 0) {
        setMediaList((prev) => [...prev, ...newItems]);
      }
    } finally {
      setIsProcessing(false);
      e.target.value = '';
    }
  };

  // Add media via URL
  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const isVid =
      urlType === 'video' ||
      urlInput.match(/\.(mp4|webm|mov|ogg)$/i) ||
      urlInput.includes('youtube.com') ||
      urlInput.includes('vimeo.com');

    setMediaList((prev) => [
      ...prev,
      { type: isVid ? 'video' : 'image', url: urlInput.trim() },
    ]);
    setUrlInput('');
  };

  const handleRemoveMedia = (idxToRemove) => {
    setMediaList((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mediaList.length === 0) {
      setErrorMsg('يرجى إضافة صورة أو فيديو واحد على الأقل للذكرى.');
      return;
    }
    if (!story.trim()) {
      setErrorMsg('يرجى كتابة وصف أو رسالة للذكرى.');
      return;
    }

    const updatedMemory = {
      ...memory,
      media: mediaList,
      image: mediaList[0]?.url || '',
      story: story.trim(),
      date,
      isFavorite,
    };

    onSave(memory.id, updatedMemory);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#FAF7F2] rounded-3xl p-4 sm:p-7 shadow-2xl border border-[#C89B53]/30 my-6 text-right max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 start-4 p-2 rounded-full text-[#8B7B83] hover:text-[#281C22] hover:bg-[#F5EFEB] transition-colors cursor-pointer"
          aria-label="إغلاق نافذة التعديل"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#281C22] mb-1">
          تعديل تفاصيل الذكرى
        </h3>
        <p className="text-xs text-[#6B5C64] mb-4">
          قم بتحديث وسائط الذكرى (صور وفيديوهات) وكتابة الوصف والمشاعر.
        </p>

        {errorMsg && (
          <div className="p-3 mb-4 text-xs text-[#882B3B] bg-[#F8E9EB] border border-[#F1D2D7] rounded-2xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Section 1: Media Items List & Upload */}
          <div>
            <label className="block font-medium text-[#281C22] mb-1.5">
              الوسائط (صور وفيديوهات) * ({mediaList.length})
            </label>

            {/* Media Previews Grid */}
            {mediaList.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {mediaList.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-[#EADBCE] group"
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#22181C] text-white">
                        <VideoIcon className="w-6 h-6 text-[#E2C082] mb-1" />
                        <span className="text-[9px] text-[#EADBCE]">فيديو</span>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt="وسيط"
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(idx)}
                      className="absolute top-1 start-1 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer shadow-xs"
                      title="حذف هذا الوسيط"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>

                    <div className="absolute bottom-1 end-1 px-1.5 py-0.5 rounded-sm bg-black/60 text-white text-[9px] bidi-text">
                      #{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-[#F5EFEB] border border-dashed border-[#C89B53] text-center text-[#8B7B83] mb-3">
                لا توجد صور أو فيديوهات حالياً. اضف وسائط بالأسفل.
              </div>
            )}

            {/* File Upload Button (Supports multiple files) */}
            <div className="flex flex-col sm:flex-row gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white border border-[#EADBCE] text-[#682535] hover:bg-[#F8E9EB] cursor-pointer transition-colors font-medium">
                <Upload className="w-4 h-4 text-[#C05665]" />
                <span>
                  {isProcessing
                    ? 'جاري معالجة الملفات...'
                    : 'رفع صور أو فيديوهات من جهازك'}
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMultipleFiles}
                  disabled={isProcessing}
                  className="hidden"
                />
              </label>
            </div>

            {/* Add URL Row */}
            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="url"
                placeholder="أو الصق رابط صورة أو فيديو مباشر هنا..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                dir="ltr"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#C89B53] text-[#682535] hover:bg-[#F8E9EB] font-medium flex items-center gap-1 cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة</span>
              </button>
            </div>
          </div>

          {/* Section 2: Story / Description (Pure memory storytelling) */}
          <div>
            <label className="block font-medium text-[#281C22] mb-1">
              الوصف والمشاعر النابعة من القلب *
            </label>
            <textarea
              rows={4}
              required
              placeholder="اكتب تفاصيل هذه اللحظة، وماذا تعني لك..."
              value={story}
              onChange={(e) => setStory(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665] leading-relaxed"
            />
          </div>

          {/* Section 3: Date & Favorite */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-medium text-[#281C22] mb-1">
                تاريخ الذكرى
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                dir="ltr"
              />
            </div>

            <div className="flex items-center gap-2 self-end pb-2">
              <input
                type="checkbox"
                id="edit-fav-box"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="w-4 h-4 rounded text-[#C05665] focus:ring-[#C05665]"
              />
              <label
                htmlFor="edit-fav-box"
                className="font-medium text-[#281C22] flex items-center gap-1 cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 text-[#C89B53]" />
                <span>تمييز كذكرى مفضلة</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#EADBCE]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#6B5C64] hover:bg-[#F5EFEB] transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-[#682535] text-white hover:bg-[#521b29] transition-colors font-medium shadow-xs cursor-pointer"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
