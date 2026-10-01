import React, { useState } from 'react';
import { KeyRound, X, AlertCircle } from 'lucide-react';

export default function AdminPinModal({ correctPin, onVerifyCustom, isOpen, onClose, onSuccess }) {
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async (codeToTest) => {
    const code = codeToTest || pinInput;
    setIsVerifying(true);
    let isValid = false;

    if (onVerifyCustom) {
      try {
        isValid = await onVerifyCustom(code);
      } catch {
        isValid = code.trim() === correctPin.trim();
      }
    } else {
      isValid = code.trim() === correctPin.trim();
    }

    setIsVerifying(false);

    if (isValid) {
      setErrorMsg('');
      setPinInput('');
      onSuccess();
    } else {
      setErrorMsg('رمز المرور غير صحيح، يرجى المحاولة ثانية.');
      setPinInput('');
    }
  };

  const handleNumberClick = (digit) => {
    if (pinInput.length < 8) {
      const next = pinInput + digit;
      setPinInput(next);
      setErrorMsg('');
      if (next.length === correctPin.length) {
        handleVerify(next);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="بوابة الدخول السرية"
      dir="rtl"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-[#FAF7F2] rounded-3xl p-6 shadow-2xl border border-[#C89B53]/30 text-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 start-4 p-1.5 rounded-full text-[#8B7B83] hover:text-[#281C22] hover:bg-[#F5EFEB] transition-colors cursor-pointer"
          aria-label="إغلاق نافذة الرمز السري"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#F8E9EB] text-[#C05665] flex items-center justify-center mx-auto mb-3 shadow-xs">
          <KeyRound className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-serif font-bold text-[#281C22] mb-1">
          بوابة مُنسّق الذكريات
        </h3>
        <p className="text-xs text-[#6B5C64] mb-5">
          أدخل الرمز السري لإضافة أو تعديل محطات الخط الزمني
        </p>

        {/* PIN Dots Display */}
        <div className="flex justify-center items-center gap-3 mb-4" dir="ltr">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                idx < pinInput.length
                  ? 'bg-[#682535] scale-110 shadow-xs'
                  : 'bg-[#EADBCE]'
              }`}
            />
          ))}
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-[#882B3B] bg-[#F8E9EB] py-1.5 px-3 rounded-xl mb-4">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mobile-Friendly Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto mb-4" dir="ltr">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              disabled={isVerifying}
              className="h-12 rounded-xl bg-white hover:bg-[#F8E9EB] border border-[#EADBCE] text-[#281C22] text-lg font-serif font-semibold active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setPinInput('')}
            disabled={isVerifying}
            className="h-12 rounded-xl bg-white/70 hover:bg-[#F5EFEB] border border-[#EADBCE] text-[#8B7B83] text-xs font-semibold active:scale-95 transition-all cursor-pointer"
          >
            مسح
          </button>
          <button
            onClick={() => handleNumberClick('0')}
            disabled={isVerifying}
            className="h-12 rounded-xl bg-white hover:bg-[#F8E9EB] border border-[#EADBCE] text-[#281C22] text-lg font-serif font-semibold active:scale-95 transition-all shadow-2xs cursor-pointer"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            disabled={isVerifying}
            className="h-12 rounded-xl bg-white/70 hover:bg-[#F5EFEB] border border-[#EADBCE] text-[#8B7B83] text-xs font-semibold active:scale-95 transition-all cursor-pointer"
          >
            حذف
          </button>
        </div>

        <div className="text-[11px] text-[#8B7B83]">
          الرمز السري الافتراضي: <span className="font-semibold text-[#682535] bidi-text">1314</span>
        </div>
      </div>
    </div>
  );
}
