import type { PortfolioContent } from '@/api/admin/model';

/**
 * Contenido bilingüe tomado de la hoja de vida (00-hoja-de-vida.docx).
 * Mismo formato que el backend (*_es / *_en): al conectar la API, este archivo deja de usarse.
 * Un texto en inglés vacío ('') hace que el sitio muestre el español (RN-01).
 */
export const portfolioSeed: PortfolioContent = {
  updatedAt: '2026-10-10T12:00:00.000Z',

  profile: {
    fullName: 'Jarlin Andrés Fonseca Bermón',
    role: 'Backend Developer · DevSecOps',
    location: 'Cúcuta, Colombia',
    intro: {
      es: 'Desarrollador de Software con más de 3 años diseñando APIs y servicios escalables, seguros y mantenibles en Java/Spring Boot y Node.js/NestJS — de la arquitectura al despliegue.',
      en: 'Software Developer with 3+ years designing scalable, secure and maintainable APIs and services with Java/Spring Boot and Node.js/NestJS — from architecture to deployment.',
    },
    photoUrl: null,
    email: 'jarlinandres5000@gmail.com',
    linkedinUser: 'jarlinfonseca',
    githubUser: 'JarlinFonseca',
    resume: {
      es: { fileName: 'CV_Jarlin_Fonseca_ES.pdf', url: '/media/cv/CV_Jarlin_Fonseca_ES.pdf' },
      en: { fileName: 'CV_Jarlin_Fonseca_EN.pdf', url: '/media/cv/CV_Jarlin_Fonseca_EN.pdf' },
    },
  },

  highlights: {
    stats: [
      {
        id: 'stat-years',
        value: '3+',
        visible: true,
        label: { es: 'años construyendo backend empresarial', en: 'years building enterprise backends' },
      },
      {
        id: 'stat-stores',
        value: '700+',
        visible: true,
        label: {
          es: 'tiendas en México usan el Portal de Garantías',
          en: 'stores in Mexico run on the Warranty Portal',
        },
      },
      {
        id: 'stat-users',
        value: '1000+',
        visible: true,
        label: { es: 'usuarios activos en el chat en tiempo real', en: 'active users on the real-time chat' },
      },
      {
        id: 'stat-envs',
        value: '3',
        visible: true,
        label: {
          es: 'ambientes con CI/CD automatizado: develop, QA y producción',
          en: 'environments with automated CI/CD: develop, QA and production',
        },
      },
    ],
    principles: [
      {
        id: 'pr-clean',
        title: { es: 'Arquitectura limpia', en: 'Clean architecture' },
        text: {
          es: 'Hexagonal, principios SOLID y Clean Code para servicios fáciles de mantener y de probar.',
          en: 'Hexagonal, SOLID and Clean Code for services that are easy to maintain and test.',
        },
      },
      {
        id: 'pr-events',
        title: { es: 'Event-driven cuando escala', en: 'Event-driven at scale' },
        text: {
          es: 'Mensajería con RabbitMQ para desacoplar servicios y procesar de forma asíncrona.',
          en: 'RabbitMQ messaging to decouple services and process work asynchronously.',
        },
      },
      {
        id: 'pr-quality',
        title: { es: 'Calidad desde el pipeline', en: 'Quality in the pipeline' },
        text: {
          es: 'Pruebas con JUnit 5 y Mockito, análisis con SonarCloud/SonarQube y seguridad con Snyk.',
          en: 'JUnit 5 and Mockito tests, SonarCloud/SonarQube analysis and Snyk security checks.',
        },
      },
      {
        id: 'pr-delivery',
        title: { es: 'Del commit a producción', en: 'From commit to production' },
        text: {
          es: 'Docker, Kubernetes, AWS, Azure DevOps y GitHub Actions para desplegar sin sorpresas.',
          en: 'Docker, Kubernetes, AWS, Azure DevOps and GitHub Actions for predictable releases.',
        },
      },
    ],
  },

  projects: [
    project(
      'warranty-portal',
      'PRIVATE',
      'Nelumbo Consultores',
      { es: 'Portal de Garantías', en: 'Warranty Portal' },
      {
        es: 'Plataforma modular en NestJS para la gestión y control de garantías de un cliente del sector asegurador en México. Archivos en buckets de AWS S3 y notificaciones por correo para los flujos operativos.',
        en: 'Modular NestJS platform to manage and track warranties for an insurance client in Mexico. Files stored in AWS S3 buckets and email notifications for operational flows.',
      },
      ['NestJS', 'TypeScript', 'AWS S3', 'Email'],
      {
        featured: true,
        clientContext: { es: 'Sector asegurador · México', en: 'Insurance sector · Mexico' },
        metricValue: '700+',
        metricLabel: { es: 'tiendas en México lo usan a diario', en: 'stores across Mexico use it daily' },
      },
    ),
    project(
      'event-dashboard',
      'PRIVATE',
      'Nelumbo Consultores',
      { es: 'Dashboard orientado a eventos', en: 'Event-driven dashboard' },
      {
        es: 'Diseñé la arquitectura con Amazon MQ (RabbitMQ) e implementé APIs publicadoras y consumidoras en NestJS. Indicadores en SQL sobre PostgreSQL analítico, ETL de históricos, reportes Excel y gráficos con Chart.js.',
        en: 'Designed the architecture on Amazon MQ (RabbitMQ) and built NestJS publisher/consumer APIs. SQL KPIs on an analytics PostgreSQL, historical ETL, Excel reports and Chart.js charts.',
      },
      ['RabbitMQ', 'Amazon MQ', 'NestJS', 'PostgreSQL', 'Chart.js'],
    ),
    project(
      'realtime-chat',
      'PRIVATE',
      'Nelumbo Consultores',
      { es: 'Chat en tiempo real', en: 'Real-time chat' },
      {
        es: 'API en NestJS con Socket.IO y WebSockets para mensajería en vivo dentro de la plataforma del cliente.',
        en: 'NestJS API with Socket.IO and WebSockets for live messaging inside the client platform.',
      },
      ['NestJS', 'Socket.IO', 'WebSockets'],
      { metricValue: '1000+', metricLabel: { es: 'usuarios activos', en: 'active users' } },
    ),
    project(
      'guatemala-panel',
      'PRIVATE',
      'Nelumbo Consultores',
      { es: 'Panel de Gestión Guatemala', en: 'Guatemala Management Panel' },
      {
        es: 'API en Spring Boot con arquitectura hexagonal y Clean Code sobre un SQL Server existente: lógica de negocio con stored procedures, vistas y funciones.',
        en: 'Spring Boot API with hexagonal architecture and Clean Code on an existing SQL Server: business logic with stored procedures, views and functions.',
      },
      ['Spring Boot', 'Hexagonal', 'SQL Server'],
    ),
    project(
      'bulk-import',
      'PRIVATE',
      'Nelumbo Consultores',
      { es: 'Carga masiva de usuarios', en: 'Bulk user import' },
      {
        es: 'API en Spring Boot con procesamiento asíncrono e hilos en segundo plano para altos volúmenes. Validación de Excel con control de errores y trazabilidad.',
        en: 'Spring Boot API with async processing and background threads for high volumes. Excel validation with error handling and traceability.',
      },
      ['Spring Boot', 'Async', 'Excel', 'Java'],
    ),
    project(
      'microservices-cicd',
      'PRIVATE',
      'Pragma',
      { es: 'CI/CD de microservicios', en: 'Microservices CI/CD' },
      {
        es: 'Automaticé el CI/CD del microservicio de logros en develop, QA y producción; build en tres microservicios, análisis estático con SonarCloud y pipelines por plantillas.',
        en: 'Automated CI/CD for the achievements microservice across develop, QA and production; builds for three microservices, SonarCloud static analysis and template-based pipelines.',
      },
      ['CI/CD', 'SonarCloud', 'Pipelines', 'DevSecOps'],
    ),
    project(
      'food-court',
      'OPEN',
      'Pragma',
      { es: 'Plazoleta de Comidas', en: 'Food Court Backend' },
      {
        es: 'Backend de microservicios construido a partir de historias de usuario, desplegado en AWS con un pipeline de CI/CD automatizado.',
        en: 'Microservices backend built from user stories, deployed on AWS with an automated CI/CD pipeline.',
      },
      ['Spring Boot', 'Microservicios', 'AWS', 'CI/CD'],
    ),
    project(
      'edtech-api',
      'OPEN',
      'No Country',
      { es: 'API para plataforma educativa', en: 'EdTech platform API' },
      {
        es: 'Lideré el equipo backend con Scrum. API en Spring Boot y MySQL desplegada en AWS con RDS, Elastic Beanstalk, Parameter Store y Docker.',
        en: 'Led the backend team with Scrum. Spring Boot + MySQL API deployed on AWS with RDS, Elastic Beanstalk, Parameter Store and Docker.',
      },
      ['Spring Boot', 'MySQL', 'AWS', 'Docker'],
    ),
    project(
      'sagis',
      'OPEN',
      'UFPS',
      { es: 'SAGIS', en: 'SAGIS' },
      {
        es: 'Sistema web para el seguimiento y acompañamiento de graduados. Aplicación monolítica en Laravel con vistas Blade.',
        en: 'Web system to follow up and support university graduates. Monolithic Laravel app with Blade views.',
      },
      ['Laravel', 'PHP', 'MySQL', 'Blade'],
    ),
    project(
      'lubrillantas',
      'OPEN',
      'UFPS',
      { es: 'Lubrillantas Jezreel AG', en: '' },
      {
        es: 'Aplicativo web para un negocio local, con Java en la lógica del servidor y JavaScript/CSS en la interfaz.',
        en: 'Web app for a local business, with Java server-side logic and a JavaScript/CSS interface.',
      },
      ['Java', 'JavaScript', 'CSS'],
    ),
    project(
      '3d-printing',
      'OPEN',
      'Redcolsi · FabLab UFPS',
      { es: 'Software open source para impresión 3D', en: 'Open-source software for 3D printing' },
      {
        es: 'Investigación presentada como ponente en Redcolsi, con calificaciones destacadas a nivel regional y nacional.',
        en: 'Research presented as speaker at Redcolsi, with outstanding scores at regional and national level.',
      },
      ['Open Source', 'Impresión 3D', 'Investigación'],
    ),
  ],

  stack: {
    categories: [
      {
        id: 'cat-languages',
        name: { es: 'Lenguajes', en: 'Languages' },
        technologies: ['Java', 'TypeScript', 'JavaScript', 'PHP', 'SQL', 'Bash'],
      },
      {
        id: 'cat-backend',
        name: { es: 'Backend', en: 'Backend' },
        technologies: [
          'Spring Boot',
          'Node.js',
          'NestJS',
          'Laravel',
          'TypeORM',
          'Socket.IO',
          'REST',
          'Microservicios',
        ],
      },
      {
        id: 'cat-data',
        name: { es: 'Datos y mensajería', en: 'Data & messaging' },
        technologies: ['PostgreSQL', 'MySQL', 'SQL Server', 'Oracle', 'RabbitMQ'],
      },
      {
        id: 'cat-cloud',
        name: { es: 'Cloud y DevOps', en: 'Cloud & DevOps' },
        technologies: [
          'AWS',
          'CloudFormation',
          'Docker',
          'Kubernetes',
          'Azure DevOps',
          'GitHub Actions',
          'Linux',
        ],
      },
      {
        id: 'cat-quality',
        name: { es: 'Calidad y seguridad', en: 'Quality & security' },
        technologies: ['JUnit 5', 'Mockito', 'SonarCloud', 'SonarQube', 'Snyk', 'Postman'],
      },
      {
        id: 'cat-practices',
        name: { es: 'Prácticas', en: 'Practices' },
        technologies: ['Hexagonal', 'SOLID', 'Clean Code', 'GitFlow', 'Scrum', 'Jira', 'Maven', 'Gradle'],
      },
    ],
    cube: ['Java', 'Spring Boot', 'NestJS', 'AWS', 'PostgreSQL', 'Docker'],
  },

  experience: [
    {
      id: 'exp-nelumbo',
      company: 'Nelumbo Consultores',
      city: 'Cúcuta, Colombia',
      role: { es: 'Desarrollador Backend', en: 'Backend Developer' },
      startMonth: '2024-02',
      endMonth: null,
      current: true,
      summary: {
        es: 'Soluciones para el sector asegurador en México: portales en producción, dashboards orientados a eventos, chat en tiempo real y APIs de carga masiva.',
        en: 'Solutions for the insurance sector in Mexico: production portals, event-driven dashboards, real-time chat and bulk-import APIs.',
      },
    },
    {
      id: 'exp-pragma',
      company: 'Pragma',
      city: 'Cúcuta, Colombia',
      role: { es: 'Backend y DevSecOps', en: 'Backend & DevSecOps' },
      startMonth: '2023-03',
      endMonth: '2023-09',
      current: false,
      summary: {
        es: 'Nuevas funcionalidades en Spring Boot, CI/CD en tres ambientes, SonarCloud y automatizaciones con Apps Script.',
        en: 'New Spring Boot features, CI/CD across three environments, SonarCloud and Apps Script automations.',
      },
    },
    {
      id: 'exp-ufps',
      company: 'Universidad Francisco de Paula Santander',
      city: 'Cúcuta, Colombia',
      role: { es: 'Desarrollador Web e Investigador Redcolsi', en: 'Web Developer & Redcolsi Researcher' },
      startMonth: '2018-02',
      endMonth: '2023-11',
      current: false,
      summary: {
        es: 'Sistemas web en Laravel y Java, liderazgo de equipos de 8 personas y ponencia en Redcolsi.',
        en: 'Web systems in Laravel and Java, led teams of 8 and presented research at Redcolsi.',
      },
    },
  ],

  education: [
    {
      id: 'edu-ufps',
      institution: 'Universidad Francisco de Paula Santander',
      city: 'Cúcuta, Colombia',
      program: { es: 'Ingeniería de Sistemas', en: 'Systems Engineering' },
      startMonth: '2018-02',
      endMonth: '2023-11',
      visible: true,
    },
    {
      id: 'edu-ipt',
      institution: 'Inglés para todos (IPT)',
      city: 'Cúcuta, Colombia',
      program: { es: 'Inglés intermedio (B1)', en: 'Intermediate English (B1)' },
      startMonth: '2018-03',
      endMonth: '2019-12',
      visible: false,
    },
    {
      id: 'edu-sena',
      institution: 'SENA',
      city: 'Cúcuta, Colombia',
      program: { es: 'Asistencia Administrativa', en: 'Administrative Assistance' },
      startMonth: '2016-02',
      endMonth: '2017-12',
      visible: false,
    },
    {
      id: 'edu-school',
      institution: 'Colegio Gremios Unidos',
      city: 'Cúcuta, Colombia',
      program: { es: 'Bachiller Técnico', en: 'Technical High School Diploma' },
      startMonth: '2016-02',
      endMonth: '2017-12',
      visible: false,
    },
  ],

  certifications: [
    {
      id: 'cert-aws',
      name: 'AWS Academy Cloud Foundations',
      issuer: 'AWS',
      kind: 'CERTIFICATION',
      issuedMonth: '2023-09',
      credentialUrl: null,
      visible: true,
    },
    {
      id: 'cert-ccna',
      name: 'CCNA: Introduction to Networks',
      issuer: 'Cisco',
      kind: 'CERTIFICATION',
      issuedMonth: '2023-02',
      credentialUrl: null,
      visible: true,
    },
    {
      id: 'cert-oracle',
      name: 'Database Programming with SQL',
      issuer: 'Oracle',
      kind: 'CERTIFICATION',
      issuedMonth: '2021-12',
      credentialUrl: null,
      visible: true,
    },
    {
      id: 'course-microservices',
      name: 'Microservicios con Spring Boot y Spring Cloud Netflix Eureka',
      issuer: 'Udemy',
      kind: 'COURSE',
      issuedMonth: '2023-10',
      credentialUrl: null,
      visible: false,
    },
    {
      id: 'course-junit',
      name: 'Guía completa JUnit y Mockito incluye Spring Boot Test',
      issuer: 'Udemy',
      kind: 'COURSE',
      issuedMonth: '2023-08',
      credentialUrl: null,
      visible: false,
    },
  ],

  languages: [
    { id: 'lang-es', name: { es: 'Español', en: 'Spanish' }, level: 'NATIVE' },
    { id: 'lang-en', name: { es: 'Inglés', en: 'English' }, level: 'B1' },
  ],
};

function project(
  id: string,
  type: 'PRIVATE' | 'OPEN',
  organization: string,
  title: { es: string; en: string },
  description: { es: string; en: string },
  technologies: string[],
  extra: Partial<PortfolioContent['projects'][number]> = {},
): PortfolioContent['projects'][number] {
  return {
    id,
    title,
    organization,
    clientContext: { es: '', en: '' },
    description,
    type,
    repositoryUrl: type === 'OPEN' ? 'https://github.com/JarlinFonseca' : null,
    technologies,
    metricValue: '',
    metricLabel: { es: '', en: '' },
    featured: false,
    visible: true,
    blurImages: type === 'PRIVATE',
    images: [],
    coverImageId: null,
    version: 1,
    ...extra,
  };
}
