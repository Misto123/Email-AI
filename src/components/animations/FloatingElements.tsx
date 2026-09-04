'use client';

import { motion } from 'framer-motion';

export default function FloatingElements() {
  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  };

  const floatingAnimationSlow = {
    y: [0, -15, 0],
    x: [0, 10, 0],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top Left - Circle */}
      <motion.div
        animate={floatingAnimation}
        className="absolute top-20 left-10 w-20 h-20 rounded-full bg-primary/10 blur-xl"
      />
      
      {/* Top Right - Star Shape */}
      <motion.div
        animate={floatingAnimationSlow}
        className="absolute top-40 right-20 w-16 h-16"
      >
        <div className="text-6xl opacity-20">✨</div>
      </motion.div>

      {/* Middle Left - Heart */}
      <motion.div
        animate={{
          y: [0, -25, 0],
          rotate: [0, 10, 0],
          transition: {
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        className="absolute top-1/3 left-1/4 w-12 h-12"
      >
        <div className="text-5xl opacity-15">💝</div>
      </motion.div>

      {/* Bottom Right - Blob */}
      <motion.div
        animate={{
          ...floatingAnimation,
          transition: { ...floatingAnimation.transition },
        }}
        className="absolute bottom-40 right-10 w-24 h-24 rounded-full bg-accent/10 blur-2xl"
      />

      {/* Center - Confetti piece */}
      <motion.div
        animate={{
          y: [0, -30, 0],
          x: [0, -15, 0],
          rotate: [0, 180, 360],
          transition: {
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        className="absolute top-1/2 right-1/3 w-8 h-8"
      >
        <div className="text-4xl opacity-20">🎉</div>
      </motion.div>

      {/* Bottom Left - Gift */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
          transition: {
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        className="absolute bottom-20 left-1/4"
      >
        <div className="text-4xl opacity-15">🎁</div>
      </motion.div>

      {/* Gradient Blob - Background */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
          transition: {
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-3xl"
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
          transition: {
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-accent/20 to-primary/20 blur-3xl"
      />
    </div>
  );
}
