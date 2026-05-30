'use client';

import { motion } from 'framer-motion';
import { skills } from '@/lib/data';
import SectionHeader from './SectionHeader';

export default function Skills() {
  return (
    <section id="skills" className="relative scroll-mt-24 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <SectionHeader eyebrow="" title="Skills" />

        <div className="flex flex-col gap-8 md:gap-10">
          {skills.map((group, idx) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: idx * 0.06, ease: 'easeOut' }}
            >
              <p className="text-accent-glow/80 mb-3 font-mono text-xs tracking-[0.25em]">
                {group.category.toUpperCase()}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="text-foreground/75 cursor-default rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm transition-all duration-200 hover:border-accent/40 hover:bg-accent/10 hover:text-accent-glow hover:shadow-[0_0_16px_-4px_rgba(167,139,250,0.55)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
