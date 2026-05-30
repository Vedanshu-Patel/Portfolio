'use client';

import { useEffect, useMemo, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

export default function ParticleBackground() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    })
      .then(() => setInit(true))
      .catch(() => setInit(false));
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: {
          value: 45,
          density: { enable: true, width: 1920, height: 1080 },
        },
        color: { value: ['#7c3aed', '#a78bfa', '#c4b5fd'] },
        shape: { type: 'circle' },
        opacity: { value: { min: 0.1, max: 0.45 } },
        size: { value: { min: 1, max: 2.5 } },
        move: {
          enable: true,
          speed: 0.4,
          direction: 'none',
          random: true,
          straight: false,
          outModes: { default: 'out' },
        },
        links: {
          enable: true,
          distance: 150,
          color: '#7c3aed',
          opacity: 0.15,
          width: 1,
        },
      },
      responsive: [
        {
          maxWidth: 640,
          options: {
            particles: {
              number: { value: 18 },
              links: { distance: 110 },
              move: { speed: 0.3 },
            },
          },
        },
        {
          maxWidth: 1024,
          options: {
            particles: {
              number: { value: 30 },
            },
          },
        },
      ],
      interactivity: {
        detectsOn: 'window',
        events: {
          onHover: { enable: true, mode: 'grab' },
          resize: { enable: true, delay: 0.5 },
        },
        modes: {
          grab: { distance: 160, links: { opacity: 0.35 } },
        },
      },
    }),
    [],
  );

  if (!init) return null;

  return (
    <Particles
      id="tsparticles"
      options={options}
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
