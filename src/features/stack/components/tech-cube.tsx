import type { CSSProperties } from 'react';
import type { Stack } from '@/api/public-portfolio/schema';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/** Estilo de cada cara, en el orden del diseño (frente, derecha, atrás, izquierda, arriba, abajo). */
const FACES: { transform: string; style: CSSProperties; labelClass: string }[] = [
  {
    transform: 'translateZ(100px)',
    style: { background: '#2D5BE3', color: '#FFFFFF' },
    labelClass: 'opacity-85',
  },
  {
    transform: 'rotateY(90deg) translateZ(100px)',
    style: { background: '#FAFAF7' },
    labelClass: 'text-ink-muted',
  },
  {
    transform: 'rotateY(180deg) translateZ(100px)',
    style: { background: '#F26B38', color: '#14161A' },
    labelClass: '',
  },
  {
    transform: 'rotateY(-90deg) translateZ(100px)',
    style: { background: '#14161A', color: '#FAFAF7' },
    labelClass: 'opacity-80',
  },
  {
    transform: 'rotateX(90deg) translateZ(100px)',
    style: { background: '#E3E9FB' },
    labelClass: 'text-ink-muted',
  },
  {
    transform: 'rotateX(-90deg) translateZ(100px)',
    style: { background: '#FAFAF7' },
    labelClass: 'text-ink-muted',
  },
];

const fontSize = (name: string) => (name.length > 10 ? 26 : name.length > 8 ? 30 : 34);

/** Cubo CSS 3D giratorio con las 6 tecnologías elegidas; decorativo (la lista accesible va aparte). */
export function TechCube({ cube, size = 300 }: { cube: Stack['cube']; size?: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <div className="cube-scene flex items-center justify-center" style={{ height: size }} aria-hidden="true">
      <div className="cube" data-animated={!reducedMotion}>
        {FACES.map((face, i) => {
          const item = cube[i];
          return (
            <div key={i} style={{ ...face.style, transform: face.transform }}>
              <span className={`font-mono text-xs ${face.labelClass}`}>
                {String(i + 1).padStart(2, '0')} / {item?.category}
              </span>
              <span
                className="font-bold tracking-[-0.02em]"
                style={{ fontSize: fontSize(item?.technology ?? ''), lineHeight: 1.05 }}
              >
                {item?.technology}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
