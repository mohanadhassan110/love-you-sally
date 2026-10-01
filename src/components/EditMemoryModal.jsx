import React, { useState } from 'react';
import { X, Upload, Image, Star } from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';

export default function EditMemoryModal({ memory, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: memory?.title || '',
    date: memory?.date || '',
    tag: memory?.tag || '',
    location: memory?.location || '',
    milestone: memory?.milestone || '',
    story: memory?.story || '',
    image: memory?.image || '',
    isFavorite: !!memory?.isFavorite,
  });

  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rawFile, setRawFile] = useState(null);

  if (!isOpen || !memory) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setRawFile(file);
      setIsCompressing(true);
      setErrorMsg('');
      const compressedDataUrl = await compressImageFile(file);
      setFormData((prev) => ({ ...prev, image: compressedDataUrl }));
    } catch (err) {
      setErrorMsg(err.message || 'حدث خطأ أثناء معالجة الصورة.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg('يرجى إدخال عنوان لهذه الذكرى.');
      return;
    }
    if (!formData.image.trim()) {
      setErrorMsg('يرجى رفع صورة أو إدخال رابط صورة صالح.');
      return;
    }

    onSave(memory.id, formData, rawFile);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="تعديل الذكرى"
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#FAF7F2] rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#C89B53]/30 my-6 text-right"
      >
        <button
          onClick={onClose}
          className="absolute top-4 start-4 p-2 rounded-full text-[#8B7B83] hover:text-[#281C22] hover:bg-[#F5EFEB] transition-colors cursor-pointer"
          aria-label="إغلاق نافذة التعديل"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-2xl font-serif font-bold text-[#281C22] mb-1">
          تعديل تفاصيل الذكرى
        </h3>
        <p className="text-xs text-[#6B5C64] mb-5">
          حدّث الصورة أو الكلمات أو محطة التاريخ
        </p>

        {errorMsg && (
          <div className="p-3 mb-4 text-xs text-[#882B3B] bg-[#F8E9EB] border border-[#F1D2D7] rounded-2xl">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Photo Preview & Upload */}
          <div>
            <label className="block font-medium text-[#281C22] mb-1.5">
              صورة المحطة
            </label>
            <div className="flex gap-4 items-start">
              {formData.image ? (
                <div className="relative w-28 h-20 rounded-2xl overflow-hidden bg-black shrink-0 border border-[#EADBCE]">
                  <img
                    src={formData.image}
                    alt="معاينة"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-28 h-20 rounded-2xl bg-[#F5EFEB] flex items-center justify-center shrink-0 border border-dashed border-[#C89B53]">
                  <Image className="w-6 h-6 text-[#C89B53]" />
                </div>
              )}

              <div className="flex-1 space-y-2">
                <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#682535] hover:bg-[#F8E9EB] cursor-pointer transition-colors font-medium">
                  <Upload className="w-3.5 h-3.5 text-[#C05665]" />
                  <span>{isCompressing ? 'جاري ضغط الصورة...' : 'رفع صورة جديدة من جهازك'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isCompressing}
                  />
                </label>
                <input
                  type="url"
                  placeholder="أو الصق رابط صورة مباشر هنا..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Title & Milestone */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-medium text-[#281C22] mb-1">
                عنوان الذكرى *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
              />
            </div>
            <div>
              <label className="block font-medium text-[#281C22] mb-1">
                رقم المحطة
              </label>
              <input
                type="text"
                placeholder="01"
                value={formData.milestone}
                onChange={(e) => setFormData({ ...formData, milestone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                dir="ltr"
              />
            </div>
          </div>

          {/* Date & Tag */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#281C22] mb-1">
                تاريخ الذكرى
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block font-medium text-[#281C22] mb-1">
                التصنيف / الطابع
              </label>
              <input
                type="text"
                placeholder="مثال: أول موعد، رحلتنا، ذكرى زواجنا"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block font-medium text-[#281C22] mb-1">
              المكان
            </label>
            <input
              type="text"
              placeholder="مثال: شاطئ دهب، أو بيتنا الدافئ"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
            />
          </div>

          {/* Story */}
          <div>
            <label className="block font-medium text-[#281C22] mb-1">
              قصتنا / رسالة من القلب
            </label>
            <textarea
              rows={4}
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665] leading-relaxed"
            />
          </div>

          {/* Favorite Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="edit-fav-toggle"
              checked={formData.isFavorite}
              onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
              className="w-4 h-4 rounded text-[#C05665] focus:ring-[#C05665]"
            />
            <label htmlFor="edit-fav-toggle" className="font-medium text-[#281C22] flex items-center gap-1 cursor-pointer">
              <Star className="w-3.5 h-3.5 text-[#C89B53]" />
              <span>تمييز كذكرى مفضلة لقلبي</span>
            </label>
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
              disabled={isCompressing}
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
