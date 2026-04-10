export default function OnboardingAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-[#090909]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_22%,rgba(255,255,255,0.05),transparent_20%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.04),transparent_18%),linear-gradient(180deg,#141414_0%,#0c0c0c_55%,#090909_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '140px 140px',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 82%)',
        }}
      />
      <div className="absolute left-[-12%] top-[8%] h-[24rem] w-[24rem] rounded-full bg-white/[0.05] blur-[120px]" />
      <div className="absolute right-[-12%] top-[16%] h-[28rem] w-[28rem] rounded-full bg-white/[0.04] blur-[150px]" />
      <div className="absolute bottom-[-22%] left-[32%] h-[30rem] w-[38rem] rounded-full bg-white/[0.035] blur-[180px]" />
    </div>
  );
}
