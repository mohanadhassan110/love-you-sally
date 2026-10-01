import React from 'react';
import { Heart, Key, SmartphoneNfc } from 'lucide-react';

export default function RomanticFooter({ couple, onOpenAdmin }) {
  return (
    <footer className="relative mt-20 pb-12 border-t border-[#EADBCE]/80 text-center text-xs text-[#8B7B83]" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 pt-10 space-y-4">
        {/* Decorative heart divider */}
        <div className="flex items-center justify-center gap-3 text-[#C89B53]">
          <div className="w-12 h-px bg-[#EADBCE]" />
          <Heart className="w-4 h-4 text-[#C05665] fill-[#C05665]" />
          <div className="w-12 h-px bg-[#EADBCE]" />
        </div>

        <p className="font-serif text-lg text-[#5F4F57] italic">
          كل قصص الحب جميلة.. لكن قصتنا هي الأقرب دائماً إلى قلبي.
        </p>

        <div className="flex items-center justify-center gap-2 text-xs text-[#8B7B83]">
          <span>صُنعت بكل حب وشوق لـ {couple?.partnerTwo || 'سارة'}</span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <SmartphoneNfc className="w-3.5 h-3.5 text-[#C89B53]" />
            هدية رقمية عبر بطاقة NFC
          </span>
        </div>

        {/* Discreet Admin Curator Access Point */}
        <div className="pt-4 flex items-center justify-center">
          <button
            onClick={onOpenAdmin}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[#A898A0] hover:text-[#682535] hover:bg-white/60 transition-all cursor-pointer"
            title="بوابة مُنسّق الذكريات"
            aria-label="بوابة الرمز السري"
          >
            <Key className="w-3.5 h-3.5 text-[#C89B53] group-hover:rotate-45 transition-transform" />
            <span>إدارة الخط الزمني</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
