import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MOCK_CREDENTIALS } from '@/testing/msw/credentials';
import { renderWithProviders } from '@/testing/render';
import { LoginForm } from './login-form';

describe('LoginForm', () => {
  it('RF-AUT-02: credenciales inválidas muestran un mensaje sin indicar cuál falló', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderWithProviders(<LoginForm onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText('Correo electrónico'), MOCK_CREDENTIALS.email);
    await user.type(screen.getByLabelText('Contraseña'), 'incorrecta');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('valida campos vacíos y formato de correo antes de enviar', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm onSuccess={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findAllByText('Este campo es obligatorio')).toHaveLength(2);
    await user.type(screen.getByLabelText('Correo electrónico'), 'no-es-correo');
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
    expect(await screen.findByText('Escribe un correo válido')).toBeInTheDocument();
  });

  it('RF-AUT-03: muestra y oculta la contraseña', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm onSuccess={vi.fn()} />);
    const input = screen.getByLabelText('Contraseña');
    expect(input).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(input).toHaveAttribute('type', 'text');
  });

  it('con credenciales válidas inicia sesión', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    renderWithProviders(<LoginForm onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText('Correo electrónico'), MOCK_CREDENTIALS.email);
    await user.type(screen.getByLabelText('Contraseña'), MOCK_CREDENTIALS.password);
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));
    await vi.waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });
});
