import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/testing/msw/db';
import { renderWithProviders } from '@/testing/render';
import { ProjectsTable } from './projects-table';

describe('ProjectsTable', () => {
  beforeEach(() => {
    db.session = { email: 'admin@test.dev', remember: false };
  });

  const renderTable = () =>
    renderWithProviders(<ProjectsTable projects={structuredClone(db.content.projects)} />);

  it('busca y filtra; al filtrar se desactiva el reordenamiento', async () => {
    const user = userEvent.setup();
    renderTable();
    expect(screen.getAllByRole('switch')).toHaveLength(11);
    await user.type(screen.getByRole('searchbox', { name: 'Buscar proyectos' }), 'nestjs');
    expect(screen.getAllByRole('switch')).toHaveLength(3);
    expect(screen.getByText('Quita la búsqueda y el filtro para reordenar')).toBeInTheDocument();
    await user.clear(screen.getByRole('searchbox'));
    await user.click(screen.getByRole('button', { name: 'Abiertos' }));
    expect(screen.getAllByRole('switch')).toHaveLength(5);
  });

  it('RF-PRO-05: el interruptor oculta el proyecto en el servidor', async () => {
    const user = userEvent.setup();
    renderTable();
    await user.click(screen.getByRole('switch', { name: 'Mostrar «SAGIS» en el sitio' }));
    expect(await screen.findByText('«SAGIS» quedó oculto como borrador')).toBeInTheDocument();
    expect(db.content.projects.find((p) => p.id === 'sagis')?.visible).toBe(false);
  });

  it('RF-PRO-08: eliminar pide confirmación y borra el proyecto', async () => {
    const user = userEvent.setup();
    renderTable();
    await user.click(screen.getByRole('button', { name: 'Eliminar «SAGIS»' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent('Se borrarán también sus imágenes');
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));
    expect(await screen.findByText('Proyecto eliminado')).toBeInTheDocument();
    expect(db.content.projects.some((p) => p.id === 'sagis')).toBe(false);
  });
});
