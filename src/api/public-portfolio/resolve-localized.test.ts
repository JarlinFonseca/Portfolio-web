import { describe, expect, it } from 'vitest';
import type { PortfolioContent } from '@/api/admin/model';
import { compareExperience, pick, resolveLocalized } from './resolve-localized';
import { portfolioSeed } from './seed/portfolio.seed';

const clone = (): PortfolioContent => structuredClone(portfolioSeed);

describe('pick (RN-01)', () => {
  it('usa el inglés si existe', () => expect(pick({ es: 'Hola', en: 'Hello' }, 'en')).toBe('Hello'));
  it('cae al español si el inglés está vacío', () =>
    expect(pick({ es: 'Hola', en: '  ' }, 'en')).toBe('Hola'));
  it('en español siempre usa el español', () => expect(pick({ es: 'Hola', en: 'Hello' }, 'es')).toBe('Hola'));
});

describe('resolveLocalized', () => {
  it('RN-02: un proyecto privado nunca expone repositorio aunque lo tenga guardado', () => {
    const content = clone();
    content.projects[0]!.repositoryUrl = 'https://github.com/secreto';
    const p = resolveLocalized(content, 'es').projects[0]!;
    expect(p.type).toBe('PRIVATE');
    expect(p.repositoryUrl).toBeNull();
  });

  it('RN-03: no entrega lo oculto (proyectos, formación, certificaciones y cifras)', () => {
    const content = clone();
    content.projects[1]!.visible = false;
    content.highlights.stats[0]!.visible = false;
    const data = resolveLocalized(content, 'es');
    expect(data.projects.map((p) => p.id)).not.toContain(content.projects[1]!.id);
    expect(data.stats).toHaveLength(3);
    expect(data.education.map((e) => e.id)).toEqual(['edu-ufps']);
    expect(data.certifications.every((c) => c.kind === 'CERTIFICATION')).toBe(true);
  });

  it('RN-01: título en inglés vacío muestra el español', () => {
    const p = resolveLocalized(portfolioSeed, 'en').projects.find((x) => x.id === 'lubrillantas');
    expect(p?.title).toBe('Lubrillantas Jezreel AG');
  });

  it('RF-PUB-16: CV del idioma activo; sin CV en inglés entrega el de español; sin ninguno es null', () => {
    expect(resolveLocalized(portfolioSeed, 'es').profile.resumeUrl).toBe(
      '/media/cv/CV_Jarlin_Fonseca_ES.pdf',
    );
    expect(resolveLocalized(portfolioSeed, 'en').profile.resumeUrl).toBe(
      '/media/cv/CV_Jarlin_Fonseca_EN.pdf',
    );
    const content = clone();
    content.profile.resume.en = null;
    expect(resolveLocalized(content, 'en').profile.resumeUrl).toBe('/media/cv/CV_Jarlin_Fonseca_ES.pdf');
    content.profile.resume = { es: null, en: null };
    expect(resolveLocalized(content, 'en').profile.resumeUrl).toBeNull();
    content.profile.resume.en = { fileName: 'cv.pdf', url: '/media/cv/en.pdf' };
    expect(resolveLocalized(content, 'en').profile.resumeUrl).toBe('/media/cv/en.pdf');
  });

  it('arma las URL de LinkedIn y GitHub desde los usuarios', () => {
    const { profile } = resolveLocalized(portfolioSeed, 'es');
    expect(profile.linkedinUrl).toBe('https://www.linkedin.com/in/jarlinfonseca');
    expect(profile.githubUrl).toBe('https://github.com/JarlinFonseca');
  });

  it('portada: usa la elegida (o la primera) y el título como alt si falta; métrica vacía es null', () => {
    const content = clone();
    const project = content.projects[0]!;
    project.images = [
      { id: 'a', url: '/media/a.png', alt: '' },
      { id: 'b', url: '/media/b.png', alt: 'Captura B' },
    ];
    project.coverImageId = null;
    expect(resolveLocalized(content, 'es').projects[0]!.cover).toEqual({
      url: '/media/a.png',
      alt: 'Portal de Garantías',
      blurred: true,
    });
    project.coverImageId = 'b';
    expect(resolveLocalized(content, 'es').projects[0]!.cover?.alt).toBe('Captura B');
    expect(resolveLocalized(content, 'es').projects[1]!.metric).toBeNull();
  });

  it('la experiencia sale ordenada: actual primero y luego por fecha de inicio', () => {
    const content = clone();
    content.experience.reverse();
    expect(resolveLocalized(content, 'es').experience.map((e) => e.id)).toEqual([
      'exp-nelumbo',
      'exp-pragma',
      'exp-ufps',
    ]);
  });

  it('las caras del cubo llevan su categoría como etiqueta', () => {
    const { cube } = resolveLocalized(portfolioSeed, 'en').stack;
    expect(cube[0]).toEqual({ technology: 'Java', category: 'Languages' });
    expect(cube[3]).toEqual({ technology: 'AWS', category: 'Cloud & DevOps' });
  });
});

describe('compareExperience', () => {
  it('desempata por fecha de fin', () => {
    const a = { current: false, startMonth: '2020-01', endMonth: '2020-05' };
    const b = { current: false, startMonth: '2020-01', endMonth: '2021-01' };
    expect([a, b].sort(compareExperience)[0]).toBe(b);
  });
});
