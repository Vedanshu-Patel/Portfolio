'use client';

import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { ArrowUpRight, Github } from 'lucide-react';
import { projects, type Project } from '@/lib/data';
import SectionHeader from './SectionHeader';
import { useSound } from './SoundProvider';

export default function Projects() {
  return (
    <section id="projects" className="relative scroll-mt-24 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow=""
          title="Projects"
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {projects.map((project, idx) => (
            <ProjectCard key={project.slug} project={project} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const { play } = useSound();

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: 'easeOut', delay: (index % 2) * 0.08 }}
    >
      <Tilt
        tiltMaxAngleX={6}
        tiltMaxAngleY={6}
        perspective={1200}
        scale={1.015}
        transitionSpeed={500}
        glareEnable={false}
        tiltReverse={false}
        className="h-full rounded-2xl"
      >
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => play('click')}
          onMouseEnter={() => play('hover')}
          className="glass group flex h-full flex-col rounded-2xl p-6 transition-all duration-300 hover:border-accent/40 hover:bg-white/[0.05] hover:shadow-[0_8px_50px_-10px_rgba(124,58,237,0.35)] md:p-7"
        >
          <div className="mb-3 flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold text-foreground transition-colors group-hover:text-accent-glow md:text-xl">
              {project.name}
            </h3>
            <ArrowUpRight
              size={18}
              className="text-foreground/40 shrink-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-glow"
            />
          </div>

          <p className="text-foreground/65 text-sm leading-relaxed md:text-[15px]">
            {project.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-md border border-accent/20 bg-accent/10 px-2 py-0.5 font-mono text-[10.5px] text-accent-glow/90"
              >
                {t}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-6">
            <span className="text-foreground/60 group-hover:text-accent-glow inline-flex items-center gap-1.5 text-xs font-medium transition-colors">
              <Github size={13} />
              View on GitHub
            </span>
          </div>
        </a>
      </Tilt>
    </motion.div>
  );
}
