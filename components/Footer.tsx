'use client';

import { Github, Linkedin, Mail } from 'lucide-react';
import { profile } from '@/lib/data';
import { useSound } from './SoundProvider';

export default function Footer() {
  const { play } = useSound();

  return (
    <footer className="relative mt-12 border-t border-white/10 md:mt-20">
      <div className="glass">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <p className="text-sm text-muted">
            © {new Date().getFullYear()} {profile.name}. Built with Next.js + Tailwind.
          </p>
          <div className="flex items-center gap-3">
            <a
              href={`mailto:${profile.email}`}
              onClick={() => play('click')}
              onMouseEnter={() => play('hover')}
              aria-label="Email"
              className="rounded-full p-2 text-foreground/60 transition-all hover:bg-white/5 hover:text-accent-glow"
            >
              <Mail size={18} />
            </a>
            <a
              href={profile.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => play('click')}
              onMouseEnter={() => play('hover')}
              aria-label="LinkedIn"
              className="rounded-full p-2 text-foreground/60 transition-all hover:bg-white/5 hover:text-accent-glow"
            >
              <Linkedin size={18} />
            </a>
            <a
              href={profile.links.github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => play('click')}
              onMouseEnter={() => play('hover')}
              aria-label="GitHub"
              className="rounded-full p-2 text-foreground/60 transition-all hover:bg-white/5 hover:text-accent-glow"
            >
              <Github size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
