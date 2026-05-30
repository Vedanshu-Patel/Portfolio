'use client';

import { motion } from 'framer-motion';
import { GraduationCap, MapPin } from 'lucide-react';
import { education } from '@/lib/data';
import SectionHeader from './SectionHeader';

export default function Education() {
  return (
    <section id="education" className="relative scroll-mt-24 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <SectionHeader eyebrow="" title="Education" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {education.map((edu, idx) => (
            <motion.div
              key={edu.school}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55, delay: idx * 0.08, ease: 'easeOut' }}
              className="glass group flex flex-col gap-5 rounded-2xl p-6 transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.05] hover:shadow-[0_8px_40px_-10px_rgba(124,58,237,0.3)] md:p-7"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-accent/15 p-2 text-accent-glow">
                  <GraduationCap size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-accent-glow md:text-xl">
                    {edu.school}
                  </h3>
                  <p className="text-foreground/70 mt-1 text-sm">{edu.degree}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <span className="font-mono text-foreground/55 tracking-wider">
                  {edu.start} — {edu.end}
                </span>
                <span className="text-muted inline-flex items-center gap-1">
                  <MapPin size={11} />
                  {edu.location}
                </span>
                <span className="rounded-full border border-accent/30 bg-accent/15 px-2 py-0.5 font-mono text-accent-glow">
                  GPA {edu.gpa}
                </span>
              </div>

              <div>
                <p className="text-muted mb-2 font-mono text-[10px] tracking-[0.3em]">
                  COURSEWORK
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {edu.coursework.map((course) => (
                    <span
                      key={course}
                      className="text-foreground/65 rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10.5px]"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
