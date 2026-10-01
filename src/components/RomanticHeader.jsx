import React, { useState, useEffect } from 'react';
import { Heart, Volume2, VolumeX, Sparkles, Key, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { romanticAudio } from '../utils/audioPlayer';

export default function RomanticHeader({ couple, onOpenAdmin }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [loveTaps, setLoveTaps] = useState(0);
  const [timeTogether, setTimeTogether] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Calculate dynamic time together
  useEffect(() => {
    const calculateTime = () => {
      if (!couple?.relationshipStartDate) return;
      const start = new Date(couple.relationshipStartDate).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, now - start);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeTogether({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [couple?.relationshipStartDate]);

  const toggleMusic = () => {
    const state = romanticAudio.toggle(couple?.customAudioUrl);
    setIsPlayingAudio(state);
  };

  const handleSendLove = (e) => {
    setLoveTaps((prev) => prev + 1);

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 26,
      spread: 60,
      origin: { x, y },
      colors: ['#C05665', '#E2C082', '#682535', '#F8E9EB'],
      shapes: ['circle'],
      scalar: 0.85,
    });
  };

  return (
    <header className="relative pt-8 sm:pt-12 pb-10 sm:pb-14 px-3 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center w-full overflow-hidden" dir="rtl">
      {/* Top Floating Controls Bar */}
      <div className="flex items-center justify-between max-w-xs sm:max-w-md mx-auto mb-6 sm:mb-8 px-3 py-1.5 sm:py-2 rounded-full romantic-glass shadow-xs">
        {/* Ambient Music Button */}
        <button
          onClick={toggleMusic}
          className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
            isPlayingAudio
              ? 'bg-[#F8E9EB] text-[#882B3B] shadow-xs'
              : 'text-[#6B5C64] hover:text-[#281C22] hover:bg-[#F5EFEB]'
          }`}
          title={isPlayingAudio ? 'كتم الموسيقى الهادئة' : 'تشغيل الموسيقى الرومانسية'}
          aria-label={isPlayingAudio ? 'كتم الموسيقى' : 'تشغيل الموسيقى'}
        >
          {isPlayingAudio ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#C05665] animate-pulse" />
              <span>موسيقى تعمل</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5" />
              <span>موسيقى هادئة</span>
            </>
          )}
        </button>

        {/* Discreet Admin Lock */}
        <button
          onClick={onOpenAdmin}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium text-[#8B7B83] hover:text-[#682535] hover:bg-[#F8E9EB]/60 transition-all cursor-pointer"
          title="إدارة الذكريات (رمز المرور السري)"
          aria-label="لوحة التحكم السرية"
        >
          <Key className="w-3.5 h-3.5 text-[#C89B53]" />
          <span>المُنسّق</span>
        </button>
      </div>

      {/* Main Romantic Names & Title */}
      <div className="space-y-3 sm:space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F8E9EB]/80 border border-[#F1D2D7] text-[11px] font-semibold text-[#882B3B]">
          <Sparkles className="w-3 h-3 text-[#C89B53]" />
          <span>ذكرى حية تخلّد أجمل أوقاتنا</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-7xl font-serif font-normal text-[#281C22] tracking-tight leading-tight break-words">
          {couple?.partnerOne || 'أحمد'}
          <span className="inline-block mx-2 text-[#C05665] font-serif italic text-2xl sm:text-5xl">&amp;</span>
          {couple?.partnerTwo || 'سارة'}
        </h1>

        <p className="text-sm sm:text-lg font-serif text-[#5F4F57] max-w-lg mx-auto leading-relaxed italic px-2">
          {couple?.quote || '«في كل العالم، ليس هناك قلبٌ لي كقلبكِ.. وفي كل العالم، ليس هناك حبٌ لكِ كحبي.»'}
        </p>
      </div>

      {/* Real-time Relationship Counter Box (Optimized for Mobile) */}
      <div className="mt-6 sm:mt-8 max-w-lg mx-auto p-3.5 sm:p-6 rounded-3xl romantic-glass shadow-xs w-full">
        <div className="flex items-center justify-center gap-1.5 text-[11px] tracking-wider text-[#8B7B83] font-semibold mb-3">
          <Calendar className="w-3.5 h-3.5 text-[#C05665]" />
          <span>رحلتنا معاً مستمرة منذ</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
          <div className="bg-[#FAF7F2]/90 rounded-2xl p-2 sm:p-3 border border-[#EADBCE] min-w-0">
            <div className="text-xl sm:text-3xl font-serif font-bold text-[#682535] bidi-text truncate">
              {timeTogether.days}
            </div>
            <div className="text-[10px] sm:text-xs text-[#8B7B83] font-medium mt-0.5">
              يوم
            </div>
          </div>

          <div className="bg-[#FAF7F2]/90 rounded-2xl p-2 sm:p-3 border border-[#EADBCE] min-w-0">
            <div className="text-xl sm:text-3xl font-serif font-bold text-[#682535] bidi-text truncate">
              {timeTogether.hours.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs text-[#8B7B83] font-medium mt-0.5">
              ساعة
            </div>
          </div>

          <div className="bg-[#FAF7F2]/90 rounded-2xl p-2 sm:p-3 border border-[#EADBCE] min-w-0">
            <div className="text-xl sm:text-3xl font-serif font-bold text-[#682535] bidi-text truncate">
              {timeTogether.minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs text-[#8B7B83] font-medium mt-0.5">
              دقيقة
            </div>
          </div>

          <div className="bg-[#FAF7F2]/90 rounded-2xl p-2 sm:p-3 border border-[#EADBCE] min-w-0">
            <div className="text-xl sm:text-3xl font-serif font-bold text-[#C05665] bidi-text truncate">
              {timeTogether.seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs text-[#8B7B83] font-medium mt-0.5">
              ثانية
            </div>
          </div>
        </div>

        {/* Tap to Send Love Interactive Button */}
        <div className="mt-4 pt-3 border-t border-[#F1D2D7]/60 flex items-center justify-center">
          <button
            onClick={handleSendLove}
            className="group relative inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#F8E9EB] hover:bg-[#F1D2D7] text-[#682535] text-xs font-semibold transition-all active:scale-95 shadow-2xs cursor-pointer"
            aria-label="أرسل نبضة حب"
          >
            <Heart className="w-4 h-4 text-[#C05665] fill-[#C05665] group-hover:scale-125 transition-transform" />
            <span>نبضة حب لكِ</span>
            {loveTaps > 0 && (
              <span className="ms-1 px-1.5 py-0.5 rounded-full bg-[#682535] text-white text-[10px] font-bold bidi-text">
                +{loveTaps}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
