import { motion, useReducedMotion } from 'motion/react';

export function BackgroundEffects() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#020202]">
      <div className="absolute inset-0 opacity-40 [perspective:1000px]">
        <motion.div
          animate={prefersReducedMotion ? undefined : { y: [0, 24, 0] }}
          transition={prefersReducedMotion ? undefined : { repeat: Infinity, duration: 16, ease: 'easeInOut' }}
          style={{ willChange: 'transform' }}
          className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:linear-gradient(to_bottom,transparent_10%,black_80%)] [transform:rotateX(75deg)_translateZ(-200px)_scale(3)] [transform-origin:center_top]"
        />
      </div>

      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : {
                scale: [1, 1.08, 1],
                opacity: [0.03, 0.055, 0.03],
                x: [0, 18, 0],
                y: [0, -12, 0],
              }
        }
        transition={prefersReducedMotion ? undefined : { duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{ willChange: 'transform, opacity' }}
        className="absolute left-[-10%] top-[-20%] h-[70vw] w-[70vw] rounded-full bg-gradient-to-br from-white to-transparent blur-[120px]"
      />
      <motion.div
        animate={
          prefersReducedMotion
            ? undefined
            : {
                scale: [1, 1.12, 1],
                opacity: [0.02, 0.04, 0.02],
                x: [0, -16, 0],
                y: [0, 10, 0],
              }
        }
        transition={prefersReducedMotion ? undefined : { duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ willChange: 'transform, opacity' }}
        className="absolute bottom-[-20%] right-[-10%] h-[60vw] w-[60vw] rounded-full bg-white blur-[150px]"
      />

      <div
        className="absolute inset-0 mix-blend-screen opacity-[0.04]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
}
