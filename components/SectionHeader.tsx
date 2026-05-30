'use client';

import { motion } from 'framer-motion';

export default function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="mb-12 flex flex-col items-center gap-3 text-center"
    >
      <p className="text-accent-glow font-mono text-xs tracking-[0.3em]">{eyebrow}</p>
      <h2 className="text-gradient text-4xl font-bold tracking-tight md:text-5xl">{title}</h2>
      {description ? (
        <p className="text-muted max-w-xl text-sm md:text-base">{description}</p>
      ) : null}
    </motion.div>
  );
}
