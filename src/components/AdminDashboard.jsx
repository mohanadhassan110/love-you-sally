import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  FolderHeart,
  Settings,
  Upload,
  Image as ImageIcon,
  Trash2,
  Edit3,
  Star,
  Download,
  UploadCloud,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { compressImageFile } from '../utils/imageCompressor';
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

  // Add Memory form state
  const [newMemory, setNewMemory] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    tag: '',
    location: '',
    milestone: (memories.length + 1).toString().padStart(2, '0'),
    story: '',
    image: '',
    isFavorite: false,
  });
  const [rawFile, setRawFile] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
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

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setRawFile(file);
      setIsCompressing(true);
      setAddError('');
      const compressedDataUrl = await compressImageFile(file);
      setNewMemory((prev) => ({ ...prev, image: compressedDataUrl }));
    } catch (err) {
      setAddError(err.message || 'حدث خطأ أثناء معالجة الصورة');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newMemory.title.trim()) {
      setAddError('يرجى كتابة عنوان لهذه الذكرى.');
      return;
    }
    if (!newMemory.image.trim()) {
      setAddError('يرجى رفع صورة أو إدخال رابط صورة صالح.');
      return;
    }

    onAddMemory(newMemory, rawFile);
    setRawFile(null);

    // Fire romantic celebration confetti
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C05665', '#E2C082', '#682535'],
    });

    showToast('تمت إضافة الذكرى للخط الزمني بنجاح!');

    // Reset form
    setNewMemory({
      title: '',
      date: new Date().toISOString().split('T')[0],
      tag: '',
      location: '',
      milestone: (memories.length + 2).toString().padStart(2, '0'),
      story: '',
      image: '',
      isFavorite: false,
    });
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
        <div className="flex items-center justify-between px-5 sm:px-8 py-4 border-b border-[#EADBCE] bg-[#F5EFEB]/80">
          <div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#281C22]">
              لوحة مُنسّق الذكريات
            </h2>
            <p className="text-xs text-[#6B5C64]">
              تحكّم في تفاصيل ومحطات قصة حبكما في هذا الخط الزمني
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-[#F8E9EB] text-[#682535] border border-[#EADBCE] transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>معاينة الهدية</span>
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
        <div className="flex items-center gap-1 px-4 sm:px-8 pt-3 border-b border-[#EADBCE] bg-white overflow-x-auto">
          <button
            onClick={() => setActiveTab('add')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'add'
                ? 'border-[#C05665] text-[#882B3B] font-bold'
                : 'border-transparent text-[#6B5C64] hover:text-[#281C22]'
            }`}
          >
            <PlusCircle className="w-4 h-4 text-[#C05665]" />
            <span>إضافة محطة جديدة</span>
          </button>

          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all shrink-0 cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all shrink-0 cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all shrink-0 cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'backup'
                ? 'border-[#C05665] text-[#882B3B] font-bold'
                : 'border-transparent text-[#6B5C64] hover:text-[#281C22]'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-[#8B7B83]" />
            <span>نسخ احتياطي واستعادة</span>
          </button>
        </div>

        {/* Scrollable Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8">
          {/* TAB 1: ADD NEW MEMORY */}
          {activeTab === 'add' && (
            <div className="max-w-2xl mx-auto">
              <h3 className="text-xl font-serif font-bold text-[#281C22] mb-1">
                إضافة محطة ذكريات جديدة
              </h3>
              <p className="text-xs text-[#6B5C64] mb-6">
                ارفع صورة تذكارية، وثّق التاريخ، واكتب كلمات نابعة من القلب.
              </p>

              {addError && (
                <div className="p-3 mb-5 text-xs text-[#882B3B] bg-[#F8E9EB] border border-[#F1D2D7] rounded-2xl">
                  {addError}
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
                {/* Image Upload Area */}
                <div>
                  <label className="block font-medium text-[#281C22] mb-1.5">
                    صورة المحطة *
                  </label>
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {newMemory.image ? (
                      <div className="relative w-full sm:w-44 aspect-[4/3] rounded-2xl overflow-hidden bg-black shrink-0 border border-[#EADBCE] shadow-2xs">
                        <img
                          src={newMemory.image}
                          alt="معاينة"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setNewMemory({ ...newMemory, image: '' })}
                          className="absolute top-2 start-2 p-1 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
                          title="إزالة الصورة"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="w-full sm:w-44 aspect-[4/3] rounded-2xl bg-white border-2 border-dashed border-[#C89B53]/50 flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-[#F8E9EB]/30 transition-colors shrink-0">
                        <Upload className="w-6 h-6 text-[#C05665] mb-2" />
                        <span className="font-semibold text-[#682535]">
                          {isCompressing ? 'جاري التحسين...' : 'رفع صورة من جهازك'}
                        </span>
                        <span className="text-[10px] text-[#8B7B83] mt-1">
                          تُحسّن تلقائياً لسرعة الهاتف
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={isCompressing}
                          className="hidden"
                        />
                      </label>
                    )}

                    <div className="flex-1 w-full space-y-2">
                      <p className="text-[#6B5C64] leading-relaxed">
                        اختر صورة من ألبوم هاتفك أو حاسوبك، أو ضع رابط صورة مباشر بالأسفل.
                      </p>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... أو رابط مباشر"
                        value={newMemory.image}
                        onChange={(e) =>
                          setNewMemory({ ...newMemory, image: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                {/* Title & Milestone Number */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="sm:col-span-2">
                    <label className="block font-medium text-[#281C22] mb-1">
                      عنوان الذكرى *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: نزهة الغروب على شاطئ الإسكندرية"
                      value={newMemory.title}
                      onChange={(e) =>
                        setNewMemory({ ...newMemory, title: e.target.value })
                      }
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
                      value={newMemory.milestone}
                      onChange={(e) =>
                        setNewMemory({ ...newMemory, milestone: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Date & Tag */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-[#281C22] mb-1">
                      تاريخ المحطة
                    </label>
                    <input
                      type="date"
                      value={newMemory.date}
                      onChange={(e) =>
                        setNewMemory({ ...newMemory, date: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-[#281C22] mb-1">
                      تصنيف / طابع المحطة
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: أول لقاء، سفرة مميزة، عشاء رومانسي"
                      value={newMemory.tag}
                      onChange={(e) =>
                        setNewMemory({ ...newMemory, tag: e.target.value })
                      }
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
                    placeholder="مثال: شاطئ دهب، أو مطبخنا الدافئ"
                    value={newMemory.location}
                    onChange={(e) =>
                      setNewMemory({ ...newMemory, location: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665]"
                  />
                </div>

                {/* Heartfelt Story */}
                <div>
                  <label className="block font-medium text-[#281C22] mb-1">
                    قصتنا والمشاعر التي عشناها
                  </label>
                  <textarea
                    rows={5}
                    placeholder="اكتب تفاصيل ما حدث، وسبب بقاء هذه اللحظة حيّة في وجدانكما..."
                    value={newMemory.story}
                    onChange={(e) =>
                      setNewMemory({ ...newMemory, story: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#EADBCE] text-[#281C22] focus:outline-hidden focus:border-[#C05665] leading-relaxed"
                  />
                </div>

                {/* Favorite Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="new-fav-toggle"
                    checked={newMemory.isFavorite}
                    onChange={(e) =>
                      setNewMemory({ ...newMemory, isFavorite: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-[#C05665] focus:ring-[#C05665]"
                  />
                  <label
                    htmlFor="new-fav-toggle"
                    className="font-medium text-[#281C22] flex items-center gap-1 cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 text-[#C89B53]" />
                    <span>تمييز كذكرى مفضلة لقلبي</span>
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-[#EADBCE]">
                  <button
                    type="submit"
                    disabled={isCompressing}
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
                    قائمة محطات الخط الزمني
                  </h3>
                  <p className="text-xs text-[#6B5C64]">
                    تعديل أو ترتيب أو حذف المحطات المسجلة ({memories.length} محطة)
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
                {memories.map((m, idx) => (
                  <div
                    key={m.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl bg-white border border-[#EADBCE] hover:border-[#C89B53]/50 transition-all gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-16 h-12 rounded-xl overflow-hidden bg-black shrink-0 border border-[#EADBCE]">
                        <img
                          src={m.image}
                          alt={m.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-[#FAF7F2] text-[#882B3B] border border-[#EADBCE] bidi-text">
                            #{m.milestone || (idx + 1).toString().padStart(2, '0')}
                          </span>
                          <h4 className="font-serif font-bold text-sm text-[#281C22]">
                            {m.title}
                          </h4>
                          {m.isFavorite && (
                            <Star className="w-3 h-3 text-[#C89B53] fill-[#C89B53]" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-[#8B7B83] mt-0.5">
                          <span className="bidi-text">{m.date}</span>
                          {m.location && <span>• {m.location}</span>}
                          {m.tag && (
                            <span className="text-[#C05665]">• {m.tag}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => setEditingMemory(m)}
                        className="p-2 rounded-xl text-[#6B5C64] hover:text-[#682535] hover:bg-[#F8E9EB] transition-colors cursor-pointer"
                        title="تعديل الذكرى"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `هل أنت متأكد من رغبتك في حذف ذكرى "${m.title}"؟`
                            )
                          ) {
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
                ))}
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
                      أي شريحة قياسية من نوع <span className="font-bold text-[#682535]">NTAG213 أو NTAG215 أو NTAG216</span> تعمل بكفاءة. سعرها رمزي ومتوفرة على أمازون ومواقع البيع، وتدعم كل هواتف الآيفون والأندرويد الحديثة.
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
                    يعيد تحميل المحطات الست الرومانسية الافتراضية بالصور والنصوص الجميلة.
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
