'use client';

import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { experience, type Experience as ExperienceType } from '@/lib/data';
import SectionHeader from './SectionHeader';

export default function Experience() {
  return (
    <section id="experience" className="relative scroll-mt-24 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <SectionHeader eyebrow="" title="Experience" />

        <div className="relative">
          <div
            aria-hidden
            className="absolute bottom-0 left-[15px] top-0 w-px bg-gradient-to-b from-transparent via-accent/40 to-transparent md:left-[19px]"
          />

          <div className="flex flex-col gap-10 md:gap-14">
            {experience.map((entry, idx) => (
              <TimelineEntry key={entry.company} entry={entry} index={idx} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineEntry({ entry, index }: { entry: ExperienceType; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.05 }}
      className="relative pl-12 md:pl-16"
    >
      <div
        aria-hidden
        className="absolute left-0 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-accent/40 bg-background/80 backdrop-blur-md md:h-10 md:w-10"
      >
        <div className="bg-accent-glow h-3 w-3 rounded-full shadow-[0_0_14px_rgba(167,139,250,0.9)] md:h-3.5 md:w-3.5" />
      </div>

      <div className="glass group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white/[0.05] hover:shadow-[0_8px_40px_-8px_rgba(124,58,237,0.25)] md:p-7">
        <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-6">
          <div>
            <h3 className="text-xl font-semibold text-foreground transition-colors group-hover:text-accent-glow md:text-2xl">
              {entry.company}
            </h3>
            <p className="text-foreground/75 mt-1 text-sm md:text-base">{entry.role}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-1 text-sm md:items-end">
            <span className="font-mono text-xs text-foreground/55 tracking-wider">
              {entry.start} — {entry.end}
            </span>
            <span className="text-muted inline-flex items-center gap-1 text-xs">
              <MapPin size={11} />
              {entry.location}
            </span>
          </div>
        </div>

        <ul className="mt-5 flex flex-col gap-2.5">
          {entry.bullets.map((bullet, i) => (
            <li key={i} className="flex gap-3">
              <span
                aria-hidden
                className="bg-accent-glow/70 mt-2 h-1 w-1 shrink-0 rounded-full"
              />
              <span className="text-foreground/70 text-sm leading-relaxed">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
