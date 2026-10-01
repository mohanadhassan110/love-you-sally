import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  FolderHeart,
  Settings,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Trash2,
  Edit3,
  Star,
  Download,
  UploadCloud,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { processMediaFile } from '../utils/imageCompressor';
import EditMemoryModal from './EditMemoryModal';

export default function AdminDashboard({
  couple,
  memories,
  isOpen,
  onClose,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
  onSaveCoupleData,
  onResetDefaults,
  onImportBackup,
  onExportBackup,
}) {
  const [activeTab, setActiveTab] = useState('add'); // 'add' | 'manage' | 'settings' | 'nfc' | 'backup'
  const [editingMemory, setEditingMemory] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Add Memory form state: multiple media + description only
  const [newMediaList, setNewMediaList] = useState([]);
  const [newUrlInput, setNewUrlInput] = useState('');
  const [newUrlType, setNewUrlType] = useState('image');
  const [newStory, setNewStory] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newIsFavorite, setNewIsFavorite] = useState(false);
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [addError, setAddError] = useState('');

  // Couple settings state
  const [settingsForm, setSettingsForm] = useState({
    partnerOne: couple?.partnerOne || '',
    partnerTwo: couple?.partnerTwo || '',
    relationshipStartDate: couple?.relationshipStartDate || '',
    quote: couple?.quote || '',
    quoteAuthor: couple?.quoteAuthor || '',
    pin: couple?.pin || '1314',
    customAudioUrl: couple?.customAudioUrl || '',
  });

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Upload multiple images/videos
  const handleMultipleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setIsProcessingMedia(true);
    setAddError('');

    try {
      const items = [];
      for (const file of files) {
        try {
          const item = await processMediaFile(file);
          items.push(item);
        } catch (err) {
          console.warn('File processing error:', file.name, err);
          setAddError(err.message || 'حدث خطأ أثناء معالجة ملف.');
        }
      }
      if (items.length > 0) {
        setNewMediaList((prev) => [...prev, ...items]);
      }
    } finally {
      setIsProcessingMedia(false);
      e.target.value = '';
    }
  };

  // Add media URL
  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!newUrlInput.trim()) return;

    const isVid =
      newUrlType === 'video' ||
      newUrlInput.match(/\.(mp4|webm|mov|ogg)$/i) ||
      newUrlInput.includes('youtube.com') ||
      newUrlInput.includes('vimeo.com');

    setNewMediaList((prev) => [
      ...prev,
      { type: isVid ? 'video' : 'image', url: newUrlInput.trim() },
    ]);
    setNewUrlInput('');
  };

  const handleRemoveMedia = (idxToRemove) => {
    setNewMediaList((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (newMediaList.length === 0) {
      setAddError('يرجى إضافة صورة أو فيديو واحد على الأقل للذكرى.');
      return;
    }
    if (!newStory.trim()) {
      setAddError('يرجى كتابة وصف أو قصة لهذه الذكرى.');
      return;
    }

    const createdItem = {
      media: newMediaList,
      image: newMediaList[0]?.url || '',
      story: newStory.trim(),
      title: newStory.trim().slice(0, 30),
      date: newDate,
      isFavorite: newIsFavorite,
    };

    onAddMemory(createdItem);

    // Fire romantic celebration confetti
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C05665', '#E2C082', '#682535'],
    });

    showToast('تمت إضافة الذكرى للخط الزمني بنجاح!');

    // Reset form
    setNewMediaList([]);
    setNewStory('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewIsFavorite(false);
    setAddError('');
  };

  const handleSettingsSubmit = (e) => {
    e.preventDefault();
    onSaveCoupleData(settingsForm);
    showToast('تم حفظ إعدادات الكابلز بنجاح!');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="لوحة إدارة الذكريات"
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#FAF7F2] rounded-3xl shadow-2xl border border-[#C89B53]/30 flex flex-col max-h-[94vh] overflow-hidden my-auto text-right"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-[#EADBCE] bg-[#F5EFEB]/80">
          <div>
            <h2 className="text-lg sm:text-2xl font-serif font-bold text-[#281C22]">
              لوحة مُنسّق الذكريات
            </h2>
            <p className="text-[11px] sm:text-xs text-[#6B5C64]">
              تحكّم في ذكريات ومحطات قصة حبكما في هذا الخط الزمني
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-[#F8E9EB] text-[#682535] border border-[#EADBCE] transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">معاينة الهدية</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8B7B83] hover:text-[#281C22] hover:bg-[#FAF7F2] transition-colors cursor-pointer"
              aria-label="إغلاق لوحة التحكم"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-[#682535] text-white text-xs py-2 px-4 text-center flex items-center justify-center gap-2 transition-all">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#E2C082]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-3 sm:px-8 pt-2.5 border-b border-[#EADBCE] bg-white overflow-x-auto select-none">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'add'
                ? 'border-[#C05665] text-[#882B3B] font-bold'
                : 'border-transparent text-[#6B5C64] hover:text-[#281C22]'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#C05665]" />
            <span>إضافة ذكرى جديدة</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'manage'
                ? 'border-[#C05665] text-[#882B3B] font-bold'
                : 'border-transparent text-[#6B5C64] hover:text-[#281C22]'
            }`}
          >
            <FolderHeart className="w-4 h-4 text-[#C89B53]" />
            <span>إدارة الذكريات ({memories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'settings'
                ? 'border-[#C05665] text-[#882B3B] font-bold'
                : 'border-transparent text-[#6B5C64] hover:text-[#281C22]'
            }`}
          >
            <Settings className="w-4 h-4 text-[#8B7B83]" />
            <span>بيانات الكابلز والرمز</span>
          </button>

          <button
            onClick={() => setActiveTab('nfc')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'nfc'
                ? 'border-[#C05665] text-[#882B3B] font-bold'
                : 'border-transparent text-[#6B5C64] hover:text-[#281C22]'
            }`}
          >
            <Smartphone className="w-4 h-4 text-[#682535]" />
            <span>دليل بطاقة NFC</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'backup'
                ? 'border-[#C05665] text-[#882B3B] font-bold'
                : 'border-transparent text-[#6B5C64] hover:text-[#281C22]'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-[#8B7B83]" />
            <span>نسخ احتياطي</span>
          </button>
        </div>

        {/* Scrollable Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7">
          {/* TAB 1: ADD NEW MEMORY (Media + Description Only) */}
          {activeTab === 'add' && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-serif font-bold text-[#281C22] mb-1">
                إضافة ذكرى جديدة
              </h3>
              <p className="text-xs text-[#6B5C64] mb-5">
                ارفع صورة أو فيديو (أو عدة صور وفيديوهات)، وثّق التاريخ، واكتب الوصف النابع من القلب.
              </p>

              {addError && (
                <div className="p-3 mb-5 text-xs text-[#882B3B] bg-[#F8E9EB] border border-[#F1D2D7] rounded-2xl">
                  {addError}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                {/* 1. Media Items Manager */}
                <div>
                  <label className="block font-medium text-[#281C22] mb-1.5">
                    صور وفيديوهات الذكرى * ({newMediaList.length})
                  </label>

                  {/* Previews Grid */}
                  {newMediaList.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                      {newMediaList.map((item, idx) => (
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
                              alt="معاينة"
                              className="w-full h-full object-cover"
                            />
                          )}

                          <button
                            type="button"
                            onClick={() => handleRemoveMedia(idx)}
                            className="absolute top-1 start-1 p-1 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer shadow-xs"
                            title="إزالة هذا الوسيط"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          <div className="absolute bottom-1 end-1 px-1.5 py-0.5 rounded-sm bg-black/60 text-white text-[9px] bidi-text">
                            #{idx + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload button (multiple images/videos) */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white border-2 border-dashed border-[#C89B53]/50 text-[#682535] hover:bg-[#F8E9EB]/30 cursor-pointer transition-colors font-medium text-center">
                      <Upload className="w-5 h-5 text-[#C05665]" />
                      <div>
                        <span className="block font-semibold">
                          {isProcessingMedia
                            ? 'جاري تجهيز الملفات...'
                            : 'رفع صور أو فيديوهات من جهازك'}
                        </span>
                        <span className="block text-[10px] text-[#8B7B83] mt-0.5">
                          يمكنك تحديد أكثر من صورة أو فيديو معاً
                        </span>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleMultipleFiles}
                        disabled={isProcessingMedia}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Direct URL input */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="أو الصق رابط صورة أو فيديو مباشر هنا..."
                      value={newUrlInput}
                      onChange={(e) => setNewUrlInput(e.target.value)}
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

                {/* 2. Heartfelt Story / Description */}
                <div>
                  <label className="block font-medium text-[#281C22] mb-1">
                    الوصف والمشاعر التي عشناها *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="اكتب تفاصيل ما حدث، وسبب بقاء هذه اللحظة حيّة في وجدانكما..."
                    value={newStory}
                    onChange={(e) => setNewStory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665] leading-relaxed"
                  />
                </div>

                {/* 3. Date & Favorite Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-medium text-[#281C22] mb-1">
                      تاريخ الذكرى
                    </label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                      dir="ltr"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-end pb-2">
                    <input
                      type="checkbox"
                      id="new-fav-box"
                      checked={newIsFavorite}
                      onChange={(e) => setNewIsFavorite(e.target.checked)}
                      className="w-4 h-4 rounded text-[#C05665] focus:ring-[#C05665]"
                    />
                    <label
                      htmlFor="new-fav-box"
                      className="font-medium text-[#281C22] flex items-center gap-1 cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-[#C89B53]" />
                      <span>تمييز كذكرى مفضلة لقلبي</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-[#EADBCE]">
                  <button
                    type="submit"
                    disabled={isProcessingMedia}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#682535] hover:bg-[#521b29] text-white font-medium text-xs shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>نشر الذكرى في الخط الزمني</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: MANAGE MEMORIES */}
          {activeTab === 'manage' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#281C22]">
                    قائمة الذكريات المسجلة
                  </h3>
                  <p className="text-xs text-[#6B5C64]">
                    تعديل أو ترتيب أو حذف الذكريات ({memories.length} ذكرى)
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('add')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F8E9EB] text-[#882B3B] hover:bg-[#F1D2D7] transition-colors cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>إضافة ذكرى</span>
                </button>
              </div>

              <div className="space-y-3">
                {memories.map((m, idx) => {
                  const mediaCount = Array.isArray(m.media) && m.media.length > 0 ? m.media.length : 1;
                  const firstMedia = Array.isArray(m.media) && m.media[0] ? m.media[0] : { type: 'image', url: m.image };
                  const isVid = firstMedia.type === 'video';

                  return (
                    <div
                      key={m.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white border border-[#EADBCE] hover:border-[#C89B53]/50 transition-all gap-3"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Thumbnail */}
                        <div className="relative w-16 h-14 rounded-xl overflow-hidden bg-black shrink-0 border border-[#EADBCE]">
                          {isVid ? (
                            <div className="w-full h-full flex items-center justify-center bg-[#22181C]">
                              <VideoIcon className="w-5 h-5 text-[#E2C082]" />
                            </div>
                          ) : (
                            <img
                              src={firstMedia.url || m.image}
                              alt="معاينة"
                              className="w-full h-full object-cover"
                            />
                          )}

                          {mediaCount > 1 && (
                            <span className="absolute bottom-0.5 start-0.5 px-1 rounded-xs bg-black/70 text-white text-[9px] font-bold">
                              {mediaCount}
                            </span>
                          )}
                        </div>

                        {/* Description Preview */}
                        <div className="min-w-0 flex-1">
                          <p className="font-normal text-xs sm:text-sm text-[#281C22] line-clamp-2 leading-relaxed">
                            {m.story || m.title || 'ذكرى جميلة'}
                          </p>
                          <div className="flex items-center gap-2.5 text-[11px] text-[#8B7B83] mt-1">
                            {m.date && <span className="bidi-text">{m.date}</span>}
                            {mediaCount > 1 && (
                              <span className="text-[#682535]">
                                • {mediaCount} صور/فيديوهات
                              </span>
                            )}
                            {m.isFavorite && (
                              <Star className="w-3 h-3 text-[#C89B53] fill-[#C89B53]" />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => setEditingMemory(m)}
                          className="p-2 rounded-xl text-[#6B5C64] hover:text-[#682535] hover:bg-[#F8E9EB] transition-colors cursor-pointer"
                          title="تعديل الذكرى"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه الذكرى؟')) {
                              onDeleteMemory(m.id);
                              showToast('تم حذف الذكرى');
                            }
                          }}
                          className="p-2 rounded-xl text-[#8B7B83] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="حذف الذكرى"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: COUPLE PROFILE & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-serif font-bold text-[#281C22] mb-1">
                إعدادات الكابلز والخط الزمني
              </h3>
              <p className="text-xs text-[#6B5C64] mb-6">
                تخصيص أسماء الشريكين، تاريخ بداية العلاقة لحساب العداد، المقولة، ورمز المرور السري.
              </p>

              <form onSubmit={handleSettingsSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#281C22] mb-1">
                      اسم الشريك الأول
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.partnerOne}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          partnerOne: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#281C22] mb-1">
                      اسم الشريك الثاني
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.partnerTwo}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          partnerTwo: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#281C22] mb-1">
                    تاريخ ووقت بداية الارتباط (يحسب العداد الحي بالثواني بناءً عليه)
                  </label>
                  <input
                    type="datetime-local"
                    value={settingsForm.relationshipStartDate.slice(0, 16)}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        relationshipStartDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                    dir="ltr"
                  />
                  <p className="text-[11px] text-[#8B7B83] mt-1">
                    العداد في أعلى الصفحة يحسب تصاعدياً وبشكل حي من هذه اللحظة.
                  </p>
                </div>

                <div>
                  <label className="block font-medium text-[#281C22] mb-1">
                    المقولة الرومانسية في أعلى الصفحة
                  </label>
                  <textarea
                    rows={3}
                    value={settingsForm.quote}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, quote: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#281C22] mb-1">
                      صاحب المقولة (اختياري)
                    </label>
                    <input
                      type="text"
                      value={settingsForm.quoteAuthor}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          quoteAuthor: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#281C22] mb-1">
                      الرمز السري (PIN) للدخول
                    </label>
                    <input
                      type="text"
                      value={settingsForm.pin}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, pin: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                      dir="ltr"
                    />
                    <p className="text-[10px] text-[#8B7B83] mt-1">
                      الرمز الافتراضي: 1314 (رمز الحب الأبدي)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#281C22] mb-1">
                    رابط مقطوعة صوتية مخصصة (MP3 stream)
                  </label>
                  <input
                    type="url"
                    placeholder="اتركه فارغاً للاعتماد على نغمات البيانو الرومانسية المدمجة"
                    value={settingsForm.customAudioUrl}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        customAudioUrl: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                    dir="ltr"
                  />
                </div>

                <div className="pt-4 border-t border-[#EADBCE]">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#682535] hover:bg-[#521b29] text-white font-medium text-xs shadow-md transition-all active:scale-98 cursor-pointer"
                  >
                    حفظ إعدادات الكابلز
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: NFC GIFT GUIDE */}
          {activeTab === 'nfc' && (
            <div className="max-w-2xl mx-auto space-y-6 text-xs text-[#5F4F57]">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#281C22] mb-1">
                  كيف تبرمج بطاقة أو هدية الـ NFC الحقيقية؟
                </h3>
                <p className="text-[#6B5C64]">
                  حوّل بطاقة أكريليك، أو ميدالية خشبية، أو صندوق هدايا إلى لمسة رقمية ساحرة تفتح هذه الصفحة بمجرد لمس الهاتف لها.
                </p>
              </div>

              {/* Step by step cards */}
              <div className="space-y-4">
                <div className="p-4 rounded-3xl bg-white border border-[#EADBCE] flex gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#F8E9EB] text-[#882B3B] font-serif font-bold text-sm flex items-center justify-center shrink-0">
                    ١
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#281C22] mb-1">
                      احصل على بطاقة أو شريحة NFC
                    </h4>
                    <p className="leading-relaxed">
                      أي شريحة قياسية من نوع <span className="font-bold text-[#682535]">NTAG213 أو NTAG215 أو NTAG216</span> تعمل بكفاءة. متوفرة على أمازون ومواقع البيع، وتدعم هواتف الآيفون والأندرويد الحديثة.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-white border border-[#EADBCE] flex gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#F8E9EB] text-[#882B3B] font-serif font-bold text-sm flex items-center justify-center shrink-0">
                    ٢
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#281C22] mb-1">
                      حمّل تطبيق "NFC Tools" المجاني
                    </h4>
                    <p className="leading-relaxed">
                      تطبيق <span className="font-bold text-[#682535]">NFC Tools</span> متوفر مجاناً على متجر Apple App Store ومتجر Google Play.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-white border border-[#EADBCE] flex gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#F8E9EB] text-[#882B3B] font-serif font-bold text-sm flex items-center justify-center shrink-0">
                    ٣
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#281C22] mb-1">
                      كتابة رابط الموقع على البطاقة
                    </h4>
                    <p className="leading-relaxed">
                      داخل التطبيق:
                    </p>
                    <ol className="list-decimal list-inside mt-1.5 space-y-1 text-[#682535] font-medium">
                      <li>اضغط على <span className="font-bold">Write</span></li>
                      <li>اضغط على <span className="font-bold">Add a record</span></li>
                      <li>اختر <span className="font-bold">URL / URI</span></li>
                      <li>
                        الصق رابط موقعك المنشور على فيرسل (مثال: <code className="bg-[#FAF7F2] px-1.5 py-0.5 rounded text-[#882B3B] bidi-text">{window.location.origin}</code>)
                      </li>
                      <li>اضغط <span className="font-bold">Write</span> وقرّب البطاقة من أعلى ظهر الهاتف لتثبيت الرابط!</li>
                    </ol>
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-white border border-[#EADBCE] flex gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#F8E9EB] text-[#882B3B] font-serif font-bold text-sm flex items-center justify-center shrink-0">
                    ٤
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#281C22] mb-1">
                      تقديم الهدية ومفاجأة شريكك
                    </h4>
                    <p className="leading-relaxed">
                      ضع البطاقة في كارت المعايدة، أو ثبتها أسفل صندوق الهدايا. بمجرد أن يقرّب شريكك هاتفه، سينبثق إشعار يفتح الخط الزمني لرحلتكما فوراً!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BACKUP & RESTORE */}
          {activeTab === 'backup' && (
            <div className="max-w-2xl mx-auto space-y-6 text-xs text-[#5F4F57]">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#281C22] mb-1">
                  النسخ الاحتياطي والاستعادة
                </h3>
                <p className="text-[#6B5C64]">
                  حافظ على ذكرياتك الثمينة بأمان بتحميل نسخة احتياطية بصيغة JSON.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="p-4 rounded-3xl bg-white border border-[#EADBCE] space-y-3">
                  <h4 className="font-serif font-bold text-sm text-[#281C22] flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-[#682535]" />
                    <span>تصدير نسخة احتياطية</span>
                  </h4>
                  <p className="text-[#8B7B83] leading-relaxed">
                    تحميل ملف `.json` يحتوي على كافة الذكريات والمحطات والتواريخ لحفظها على جهازك.
                  </p>
                  <button
                    onClick={async () => {
                      const json = await onExportBackup();
                      const blob = new Blob([json], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `our_story_backup_${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      showToast('تم تحميل النسخة الاحتياطية!');
                    }}
                    className="w-full py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F8E9EB] text-[#682535] font-semibold border border-[#EADBCE] transition-colors cursor-pointer"
                  >
                    تحميل ملف JSON
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-4 rounded-3xl bg-white border border-[#EADBCE] space-y-3">
                  <h4 className="font-serif font-bold text-sm text-[#281C22] flex items-center gap-1.5">
                    <UploadCloud className="w-4 h-4 text-[#C05665]" />
                    <span>استعادة من نسخة احتياطية</span>
                  </h4>
                  <p className="text-[#8B7B83] leading-relaxed">
                    اختر ملف `.json` تم تصديره مسبقاً لاستعادة الذكريات على هذا الجهاز.
                  </p>
                  <label className="block w-full py-2 text-center rounded-xl bg-[#FAF7F2] hover:bg-[#F8E9EB] text-[#682535] font-semibold border border-[#EADBCE] cursor-pointer transition-colors">
                    <span>اختيار ملف JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                          const res = await onImportBackup(event.target.result);
                          if (res.success) {
                            showToast('تمت استعادة النسخة الاحتياطية بنجاح!');
                          } else {
                            alert('فشل في قراءة النسخة الاحتياطية: ' + res.error);
                          }
                        };
                        reader.readAsText(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Reset to sample data */}
              <div className="p-4 rounded-3xl bg-[#F8E9EB]/60 border border-[#F1D2D7] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#882B3B]">
                    إعادة ضبط الذكريات الافتراضية
                  </h4>
                  <p className="text-[#8B7B83] text-[11px] mt-0.5">
                    يعيد تحميل المحطات الرومانسية الافتراضية بالصور والنصوص الجميلة.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (
                      window.confirm(
                        'هل أنت متأكد من رغبتك في إعادة ضبط الذكريات للبيانات الافتراضية؟'
                      )
                    ) {
                      await onResetDefaults();
                      showToast('تمت إعادة الضبط للذكريات الافتراضية');
                    }
                  }}
                  className="px-4 py-1.5 rounded-xl bg-white text-[#882B3B] hover:bg-[#F8E9EB] border border-[#F1D2D7] font-semibold transition-colors shrink-0 cursor-pointer"
                >
                  إعادة ضبط
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Memory Submodal */}
      {editingMemory && (
        <EditMemoryModal
          memory={editingMemory}
          isOpen={!!editingMemory}
          onClose={() => setEditingMemory(null)}
          onSave={(id, updated, file) => {
            onUpdateMemory(id, updated, file);
            showToast('تم تحديث الذكرى بنجاح!');
          }}
        />
      )}
    </div>
  );
}
