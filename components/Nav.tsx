'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FileText, Menu, Volume2, VolumeX, X } from 'lucide-react';
import { useSound } from './SoundProvider';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '#home', label: 'Home' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#education', label: 'Education' },
  { href: '#contact', label: 'Contact' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const { enabled, toggle, play } = useSound();

  return (
    <nav className="fixed inset-x-0 top-0 z-50">
      <div className="glass-strong border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="#home"
            onClick={() => play('click')}
            className="font-mono text-sm text-foreground/80 transition-colors hover:text-accent-glow"
          >
            ./vedanshu
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => play('click')}
                onMouseEnter={() => play('hover')}
                className="text-sm text-foreground/70 transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={toggle}
              aria-label={enabled ? 'Mute sound effects' : 'Enable sound effects'}
              className="rounded-full p-1.5 text-foreground/60 transition-colors hover:bg-white/5 hover:text-foreground"
            >
              {enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => play('click')}
              onMouseEnter={() => play('hover')}
              className="flex items-center gap-1.5 rounded-full bg-accent/90 px-3.5 py-1.5 text-sm font-medium text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:bg-accent-glow hover:shadow-[0_0_28px_rgba(167,139,250,0.5)]"
            >
              <FileText size={14} />
              Resume
            </a>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="text-foreground md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div
          className={cn(
            'overflow-hidden border-t border-white/10 md:hidden',
            open ? 'max-h-96' : 'max-h-0',
            'transition-[max-height] duration-300 ease-out',
          )}
        >
          <div className="flex flex-col gap-4 px-6 py-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  play('click');
                  setOpen(false);
                }}
                className="text-sm text-foreground/75 transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center justify-between border-t border-white/10 pt-3">
              <button
                onClick={toggle}
                className="flex items-center gap-2 text-sm text-foreground/70"
              >
                {enabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>Sound {enabled ? 'on' : 'off'}</span>
              </button>
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => play('click')}
                className="flex items-center gap-1.5 rounded-full bg-accent/90 px-3 py-1.5 text-sm font-medium text-white"
              >
                <FileText size={14} />
                Resume
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
