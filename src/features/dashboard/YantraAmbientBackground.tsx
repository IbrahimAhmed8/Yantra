export default function YantraAmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 opacity-80">
        <div className="absolute left-[-12%] top-[-2%] h-[40rem] w-[40rem] rounded-full bg-white/[0.07] blur-[130px]" />
        <div className="absolute right-[-14%] top-[18%] h-[42rem] w-[42rem] rounded-full bg-white/[0.055] blur-[145px]" />
        <div className="absolute bottom-[-18%] left-[18%] h-[38rem] w-[46rem] rounded-full bg-white/[0.05] blur-[160px]" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
          maskImage: 'radial-gradient(circle at center, black 45%, transparent 88%)',
        }}
      />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_32%),radial-gradient(circle_at_78%_22%,rgba(255,255,255,0.05),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_22%,transparent_78%,rgba(255,255,255,0.04))]" />

      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-screen"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 160 160%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22/%3E%3C/filter%3E%3Crect width=%22160%22 height=%22160%22 filter=%22url(%23noise)%22 opacity=%220.9%22/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
}
