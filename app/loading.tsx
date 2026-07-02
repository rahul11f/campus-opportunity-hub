import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50 dark:bg-[#0f172a]">
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated outer rings */}
        <div className="absolute inset-0 -m-8 flex items-center justify-center">
          <div className="h-32 w-32 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full border border-primary/30 opacity-75"></div>
        </div>
        <div className="absolute inset-0 -m-4 flex items-center justify-center">
          <div className="h-24 w-24 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full border-2 border-primary/50 opacity-50 shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10 h-20 w-20 overflow-hidden rounded-2xl shadow-2xl bg-white p-2 border border-slate-100 dark:border-slate-800 animate-pulse">
          <Image 
            src="/icon-192.png" 
            alt="Campus Opportunity Hub Loading" 
            width={80} 
            height={80}
            className="object-contain w-full h-full"
            priority
          />
        </div>

        {/* Loading Text */}
        <div className="z-10 flex flex-col items-center gap-2 mt-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent animate-pulse">
            Campus Opportunity Hub
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
