'use client';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white space-y-6">
      <img
        src="/loadings/loading.gif"
        alt="Loading..."
        className="w-120 h-60 object-contain"
      />
      <p className="text-lg flex items-center">
        Loading
        <span className="ml-1 flex space-x-1">
          <span className="dot animate-dot animation-delay-0">.</span>
          <span className="dot animate-dot animation-delay-1">.</span>
          <span className="dot animate-dot animation-delay-2">.</span>
        </span>
      </p>
      <style jsx>{`
        .dot {
          opacity: 0;
          animation: dotFade 1.5s infinite;
        }
        .animation-delay-0 {
          animation-delay: 0s;
        }
        .animation-delay-1 {
          animation-delay: 0.3s;
        }
        .animation-delay-2 {
          animation-delay: 0.6s;
        }
        @keyframes dotFade {
          0%, 20% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
