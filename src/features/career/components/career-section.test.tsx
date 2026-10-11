import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { resolveLocalized } from '@/api/public-portfolio/resolve-localized';
import { portfolioSeed } from '@/api/public-portfolio/seed/portfolio.seed';
import { renderWithProviders } from '@/testing/render';
import { CareerSection } from './career-section';

describe('CareerSection', () => {
  it('marca la experiencia actual y formatea fechas por idioma', () => {
    const data = resolveLocalized(portfolioSeed, 'en');
    renderWithProviders(<CareerSection {...data} />, { lang: 'en' });
    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('Feb 2024 — now')).toBeInTheDocument();
    expect(screen.getByText('Mar — Sep 2023')).toBeInTheDocument();
    expect(screen.getByText('Native')).toBeInTheDocument();
  });

  it('enlaza la certificación con URL de credencial y oculta bloques vacíos', () => {
    const data = resolveLocalized(portfolioSeed, 'es');
    const certifications = data.certifications.map((c, i) =>
      i === 0 ? { ...c, credentialUrl: 'https://aws.amazon.com/verify/1' } : c,
    );
    renderWithProviders(<CareerSection {...data} certifications={certifications} languages={[]} />);
    expect(screen.getByRole('link', { name: /AWS Academy Cloud Foundations/ })).toHaveAttribute(
      'href',
      'https://aws.amazon.com/verify/1',
    );
    expect(screen.queryByText('Idiomas')).not.toBeInTheDocument();
  });
});
