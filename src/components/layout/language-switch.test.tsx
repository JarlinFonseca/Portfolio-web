import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '@/testing/render';
import { LanguageSwitch } from './language-switch';

describe('LanguageSwitch', () => {
  it('marca el idioma actual y enlaza al otro', () => {
    renderWithProviders(<LanguageSwitch current="es" />, { route: '/es' });
    expect(screen.getByRole('link', { name: 'Español' })).toHaveAttribute('aria-current', 'true');
    const en = screen.getByRole('link', { name: 'English' });
    expect(en).toHaveAttribute('href', '/en');
    expect(en).toHaveAttribute('lang', 'en');
  });

  it('conserva la sección actual (hash) al cambiar de idioma', async () => {
    const user = userEvent.setup();
    window.location.hash = '#stack';
    const { router } = renderWithProviders(<LanguageSwitch current="es" />, { route: '/es' });
    await user.click(screen.getByRole('link', { name: 'English' }));
    expect(router.state.location.pathname).toBe('/en');
    expect(router.state.location.hash).toBe('#stack');
    window.location.hash = '';
  });
});
