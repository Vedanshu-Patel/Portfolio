'use client';

import { motion } from 'framer-motion';
import { BookOpen, ExternalLink } from 'lucide-react';
import { publications } from '@/lib/data';
import { useSound } from './SoundProvider';

export default function Publication() {
  const { play } = useSound();

  if (publications.length === 0) return null;

  return (
    <section className="relative px-6 pb-12 md:pb-20">
      <div className="mx-auto max-w-4xl">
        {publications.map((pub, idx) => (
          <motion.a
            key={pub.url}
            href={pub.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => play('click')}
            onMouseEnter={() => play('hover')}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
            className="glass group flex items-start gap-5 rounded-2xl p-6 transition-all duration-300 hover:border-accent/50 hover:bg-white/[0.05] hover:shadow-[0_8px_40px_-10px_rgba(124,58,237,0.4)] md:p-8"
          >
            <div className="rounded-xl bg-accent/15 p-3 text-accent-glow shrink-0">
              <BookOpen size={22} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-accent-glow/80 mb-1.5 font-mono text-[10px] tracking-[0.3em]">
                PUBLISHED PAPER
              </p>
              <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-accent-glow md:text-xl">
                {pub.title}
              </h3>
              <p className="text-muted mt-1 text-sm">{pub.venue}</p>
              <p className="text-foreground/65 mt-3 text-sm leading-relaxed">
                {pub.description}
              </p>
            </div>
            <ExternalLink
              size={18}
              className="text-foreground/40 shrink-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-glow"
            />
          </motion.a>
        ))}
      </div>
    </section>
  );
}
