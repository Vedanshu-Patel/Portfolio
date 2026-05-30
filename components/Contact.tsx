'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Github, Linkedin, Mail } from 'lucide-react';
import { profile } from '@/lib/data';
import SectionHeader from './SectionHeader';
import { useSound } from './SoundProvider';

export default function Contact() {
  const [copied, setCopied] = useState(false);
  const { play } = useSound();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      play('click');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore — clipboard API unavailable
    }
  };

  return (
    <section id="contact" className="relative scroll-mt-24 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeader
          eyebrow=""
          title="Get in touch"
          
        />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="glass rounded-3xl p-8 text-center md:p-12"
        >
          <a
            href={`mailto:${profile.email}`}
            onClick={() => play('click')}
            onMouseEnter={() => play('hover')}
            className="text-gradient inline-block max-w-full font-mono text-sm transition-opacity hover:opacity-80 sm:text-base md:text-2xl"
            style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
          >
            {profile.email}
          </a>

          <div className="mt-6 flex justify-center">
            <button
              onClick={handleCopy}
              className="glass flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground/85 transition-all hover:border-accent/40 hover:bg-white/[0.06] hover:text-foreground"
              aria-label="Copy email to clipboard"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-accent-glow" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copy email
                </>
              )}
            </button>
          </div>

          <div className="mt-8 flex justify-center gap-3 border-t border-white/10 pt-8">
            <a
              href={`mailto:${profile.email}`}
              onClick={() => play('click')}
              onMouseEnter={() => play('hover')}
              aria-label="Email"
              className="glass rounded-full p-3 text-foreground/60 transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-accent-glow"
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
              className="glass rounded-full p-3 text-foreground/60 transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-accent-glow"
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
              className="glass rounded-full p-3 text-foreground/60 transition-all hover:border-accent/40 hover:bg-accent/10 hover:text-accent-glow"
            >
              <Github size={18} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
