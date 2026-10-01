import React, { useMemo } from 'react';

export default function AmbientParticles() {
  // Generate a fixed set of romantic floating particles
  const particles = useMemo(() => {
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: `${(i * 5.8 + 3) % 96}%`,
      top: `${(i * 7.3 + 5) % 92}%`,
      size: (i % 3 === 0 ? 16 : i % 2 === 0 ? 10 : 6),
      delay: (i * 0.4) % 5,
      duration: 6 + ((i * 1.3) % 6),
      opacity: 0.25 + ((i * 0.05) % 0.35),
      isHeart: i % 4 === 0,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Soft warm radial gradient glow spots */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#F8E9EB] opacity-60 blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-[#F5EFEB] opacity-70 blur-3xl" />
      <div className="absolute -bottom-32 left-1/4 w-[32rem] h-[32rem] rounded-full bg-[#F2DEB9]/30 blur-3xl" />

      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-gentle-float transition-transform"
          style={{
            left: p.left,
            top: p.top,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
          }}
        >
          {p.isHeart ? (
            <svg
              width={p.size}
              height={p.size}
              viewBox="0 0 24 24"
              fill="#C05665"
              className="drop-shadow-sm"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <div
              className="rounded-full bg-gradient-to-tr from-[#E2C082] to-[#C05665] blur-[0.5px]"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
