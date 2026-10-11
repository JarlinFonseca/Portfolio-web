import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { resolveLocalized } from '@/api/public-portfolio/resolve-localized';
import { portfolioSeed } from '@/api/public-portfolio/seed/portfolio.seed';
import { renderWithProviders } from '@/testing/render';
import { ContactSection } from './contact-section';

const { profile } = resolveLocalized(portfolioSeed, 'es');

describe('ContactSection', () => {
  it('correo con mailto y redes en pestaña nueva', () => {
    renderWithProviders(<ContactSection profile={profile} />);
    expect(screen.getByRole('link', { name: `Escribir a ${profile.email}` })).toHaveAttribute(
      'href',
      `mailto:${profile.email}`,
    );
    for (const name of [/LinkedIn/, /GitHub/]) {
      expect(screen.getByRole('link', { name })).toHaveAttribute('target', '_blank');
    }
    expect(screen.getByRole('link', { name: 'Descargar HV' })).toHaveAttribute('href', profile.resumeUrl);
  });

  it('sin CV el botón queda deshabilitado con texto explicativo', () => {
    renderWithProviders(<ContactSection profile={{ ...profile, resumeUrl: null }} />);
    const button = screen.getByRole('link', { name: 'Descargar HV' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).not.toHaveAttribute('href');
    expect(button).toHaveAccessibleDescription('La hoja de vida todavía no está disponible');
  });
});
