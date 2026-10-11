import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

// routes.ts se evalúa en Node durante el build: si el admin está apagado, sus rutas no existen en el bundle.
const adminEnabled = process.env.VITE_ENABLE_ADMIN === 'true';

export default [
  index('routes/root-redirect.tsx'), // "/" → /es | /en
  route(':lang', 'routes/public/layout.tsx', [index('routes/public/home.tsx')]),
  ...(adminEnabled
    ? prefix('admin', [
        route('login', 'routes/admin/login.tsx'),
        layout('routes/admin/layout.tsx', [
          index('routes/admin/index-redirect.tsx'), // /admin → /admin/projects
          route('projects', 'routes/admin/projects.tsx'),
          route('projects/new', 'routes/admin/project-edit.tsx', { id: 'project-new' }),
          route('projects/:id', 'routes/admin/project-edit.tsx', { id: 'project-edit' }),
          route('career', 'routes/admin/career.tsx'),
          route('stack', 'routes/admin/stack.tsx'),
          route('highlights', 'routes/admin/highlights.tsx'),
          route('profile', 'routes/admin/profile.tsx'),
        ]),
      ])
    : []),
  route('*', 'routes/public/not-found.tsx'),
] satisfies RouteConfig;
