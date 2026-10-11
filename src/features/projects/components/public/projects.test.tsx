import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { resolveLocalized } from '@/api/public-portfolio/resolve-localized';
import { portfolioSeed } from '@/api/public-portfolio/seed/portfolio.seed';
import { renderWithProviders } from '@/testing/render';
import { countByFilter, filterProjects } from '../../utils/filter-projects';
import { ProjectCard } from './project-card';
import { ProjectsSection } from './projects-section';

const projects = resolveLocalized(portfolioSeed, 'es').projects;
const privateProject = projects.find((p) => p.type === 'PRIVATE')!;
const openProject = projects.find((p) => p.type === 'OPEN')!;

describe('filterProjects', () => {
  it('filtra por tipo sin mutar ni reordenar', () => {
    const copy = [...projects];
    expect(filterProjects(projects, 'open').every((p) => p.type === 'OPEN')).toBe(true);
    expect(filterProjects(projects, 'all')).toEqual(projects);
    expect(projects).toEqual(copy);
  });
  it('cuenta por filtro', () => expect(countByFilter(projects)).toEqual({ all: 11, private: 6, open: 5 }));
});

describe('ProjectCard', () => {
  it('privado: muestra el candado NDA y ningún enlace al código', () => {
    renderWithProviders(<ProjectCard project={privateProject} index={0} />);
    expect(screen.getByText('Código privado · NDA')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('700+')).toBeInTheDocument();
  });

  it('abierto: enlace al repositorio en pestaña nueva y anunciado', () => {
    renderWithProviders(<ProjectCard project={openProject} index={6} />);
    const link = screen.getByRole('link', { name: /Ver en GitHub/ });
    expect(link).toHaveAttribute('href', openProject.repositoryUrl);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent('abre en una pestaña nueva');
    expect(screen.getByText('07 · Pragma')).toBeInTheDocument();
  });

  it('con portada desenfocada usa la imagen con su alt', () => {
    renderWithProviders(
      <ProjectCard
        project={{ ...privateProject, cover: { url: '/media/x.png', alt: 'Captura', blurred: true } }}
        index={0}
      />,
    );
    expect(screen.getByRole('img', { name: 'Captura' })).toHaveClass('blur-md');
  });
});

describe('ProjectsSection', () => {
  it('muestra contadores y filtra al pulsar', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProjectsSection projects={projects} />);
    const group = screen.getByRole('group', { name: 'Filtrar proyectos' });
    const all = within(group).getByRole('button', { name: /Todos/ });
    const open = within(group).getByRole('button', { name: /Abiertos y académicos/ });
    expect(all).toHaveAttribute('aria-pressed', 'true');
    expect(open).toHaveTextContent('5');
    expect(screen.getAllByRole('article')).toHaveLength(11);

    await user.click(open);
    expect(open).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByRole('status')).toHaveTextContent('5 proyectos');
  });

  it('el destacado ocupa doble ancho en escritorio', () => {
    renderWithProviders(<ProjectsSection projects={projects} />);
    const featured = screen.getByRole('heading', { name: 'Portal de Garantías' }).closest('li');
    expect(featured).toHaveClass('min-[901px]:col-span-2');
  });
});
