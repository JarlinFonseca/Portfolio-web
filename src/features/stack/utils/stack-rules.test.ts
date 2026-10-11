import { describe, expect, it } from 'vitest';
import type { AdminStack } from '@/api/admin/model';
import { hasDuplicate, releaseCubeFaces, validateStack } from './stack-rules';

const stack = (): AdminStack => ({
  categories: [
    { id: 'a', name: { es: 'Lenguajes', en: '' }, technologies: ['Java', 'SQL', 'Bash'] },
    { id: 'b', name: { es: 'Backend', en: '' }, technologies: ['Spring Boot', 'NestJS', 'Node.js'] },
  ],
  cube: ['Java', 'SQL', 'Bash', 'Spring Boot', 'NestJS', 'Node.js'],
});

describe('validateStack', () => {
  it('un stack completo no tiene problemas', () => expect(validateStack(stack())).toEqual([]));

  it('exige nombre en español, caras elegidas y sin repetir', () => {
    const s = stack();
    s.categories[0]!.name.es = ' ';
    s.cube[1] = null;
    s.cube[5] = 'Java';
    expect(validateStack(s)).toEqual([
      { kind: 'categoryName', categoryId: 'a' },
      { kind: 'cubeEmpty', face: 1 },
      { kind: 'cubeDuplicate', face: 5 },
    ]);
  });
});

describe('releaseCubeFaces (RF-STK-07)', () => {
  it('libera las caras cuya tecnología ya no existe', () => {
    const s = stack();
    s.categories[1]!.technologies = ['Spring Boot'];
    const { stack: next, freed } = releaseCubeFaces(s);
    expect(freed).toEqual([
      { face: 4, tech: 'NestJS' },
      { face: 5, tech: 'Node.js' },
    ]);
    expect(next.cube).toEqual(['Java', 'SQL', 'Bash', 'Spring Boot', null, null]);
  });
});

describe('hasDuplicate (RF-STK-04)', () => {
  it('no distingue mayúsculas ni espacios', () => {
    expect(hasDuplicate(['Java'], ' java ')).toBe(true);
    expect(hasDuplicate(['Java'], 'Kotlin')).toBe(false);
  });
});
