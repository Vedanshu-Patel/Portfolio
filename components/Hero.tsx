'use client';

import { motion, type Variants } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { ChevronDown, FileText, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { profile } from '@/lib/data';
import { useSound } from './SoundProvider';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const avatarVariants: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, ease: 'easeOut', delay: 0.2 },
  },
};

export default function Hero() {
  const { play } = useSound();

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center px-6 pb-20 pt-28 md:pt-24"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 md:grid-cols-[1.3fr_1fr]">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6 text-center md:text-left"
        >
          <motion.p
            variants={itemVariants}
            className="text-muted font-mono text-sm tracking-widest"
          >
            HI, I&apos;M
          </motion.p>

          <motion.h1
            variants={itemVariants}
            className="text-gradient text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
          >
            {profile.name}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-xl font-medium text-foreground/85 md:text-2xl"
          >
            {profile.tagline}
          </motion.p>

          <motion.p
            variants={itemVariants}
            className="max-w-xl text-base leading-relaxed text-foreground/65 md:text-lg"
          >
            {profile.bio}
          </motion.p>

          <motion.div variants={itemVariants} className="flex justify-center md:justify-start">
            <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-foreground/75">
              <MapPin size={12} className="text-accent-glow" />
              {profile.location}
            </span>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="mt-2 flex flex-wrap justify-center gap-3 md:justify-start"
          >
            <a
              href={`mailto:${profile.email}`}
              onClick={() => play('click')}
              onMouseEnter={() => play('hover')}
              className="group flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-[0_0_24px_rgba(124,58,237,0.35)] transition-all hover:bg-accent-glow hover:shadow-[0_0_32px_rgba(167,139,250,0.55)]"
            >
              <Mail size={16} />
              Email me
            </a>
            <a
              href={profile.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => play('click')}
              onMouseEnter={() => play('hover')}
              className="glass flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground/85 transition-all hover:border-accent/40 hover:bg-white/[0.06] hover:text-foreground"
            >
              <Linkedin size={16} />
              LinkedIn
            </a>
            <a
              href={profile.links.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => play('click')}
              onMouseEnter={() => play('hover')}
              className="glass flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground/85 transition-all hover:border-accent/40 hover:bg-white/[0.06] hover:text-foreground"
            >
              <Github size={16} />
              GitHub
            </a>
            <a
              href={profile.links.resume}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => play('click')}
              onMouseEnter={() => play('hover')}
              className="glass flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground/85 transition-all hover:border-accent/40 hover:bg-white/[0.06] hover:text-foreground"
            >
              <FileText size={16} />
              Resume
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          variants={avatarVariants}
          initial="hidden"
          animate="visible"
          className="flex justify-center md:justify-end"
        >
          <Tilt
            tiltMaxAngleX={14}
            tiltMaxAngleY={14}
            perspective={1000}
            scale={1.03}
            transitionSpeed={500}
            glareEnable
            glareMaxOpacity={0.25}
            glareColor="#a78bfa"
            glarePosition="all"
            className="rounded-full"
          >
            <div className="relative h-64 w-64 md:h-80 md:w-80">
              <div
                aria-hidden
                className="absolute inset-0 animate-glow rounded-full bg-gradient-to-br from-accent-glow via-accent to-purple-900 opacity-50 blur-2xl"
              />
              <div
                aria-hidden
                className="absolute -inset-1 rounded-full bg-gradient-to-br from-accent-glow/50 via-accent/40 to-accent-glow/50"
              />
              <div className="glass-strong relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-white/20">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-accent/15"
                />
                <span className="text-gradient relative font-mono text-7xl font-bold tracking-tight md:text-8xl">
                  VP
                </span>
              </div>
            </div>
          </Tilt>
        </motion.div>
      </div>

      <ScrollIndicator />
    </section>
  );
}

function ScrollIndicator() {
  return (
    <motion.a
      href="#experience"
      aria-label="Scroll to experience"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.6 }}
      className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-foreground/40 transition-colors hover:text-foreground/80 md:flex"
    >
      <span className="font-mono text-[10px] tracking-[0.3em]">SCROLL</span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ChevronDown size={18} />
      </motion.div>
    </motion.a>
  );
}
