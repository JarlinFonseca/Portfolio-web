import { portfolioContentSchema, type PortfolioContent } from '@/api/admin/model';
import { portfolioSeed } from '@/api/public-portfolio/seed/portfolio.seed';
import { MOCK_CREDENTIALS } from './credentials';

export { MOCK_CREDENTIALS };

/** Base de datos en memoria de los mocks, creada a partir del seed (validado con el contrato). */
export interface MockDb {
  content: PortfolioContent;
  account: { loginEmail: string; password: string };
  session: { email: string; remember: boolean } | null;
  failedLogins: number;
  /** Archivos subidos (base64), servidos en /media/mock/:key como lo haría S3 + CloudFront. */
  files: Record<string, { type: string; base64: string }>;
}

const STORAGE_KEY = 'portfolio-msw-db';
const canPersist = () =>
  typeof window !== 'undefined' && typeof sessionStorage !== 'undefined' && !import.meta.env.VITEST;

function fresh(): MockDb {
  return {
    content: portfolioContentSchema.parse(structuredClone(portfolioSeed)),
    account: { loginEmail: MOCK_CREDENTIALS.email, password: MOCK_CREDENTIALS.password },
    session: null,
    failedLogins: 0,
    files: {},
  };
}

function load(): MockDb {
  if (canPersist()) {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as Partial<MockDb> & Omit<MockDb, 'files'>;
        return { ...stored, files: stored.files ?? {} };
      }
    } catch {
      // datos corruptos: se reinicia
    }
  }
  return fresh();
}

export let db: MockDb = load();

/** Guarda el estado (en el navegador sobrevive a recargas durante la sesión de desarrollo). */
export function persist() {
  db.content.updatedAt = new Date().toISOString();
  if (!canPersist()) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // cuota llena (archivos grandes): se guarda sin archivos; seguirán disponibles hasta recargar
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...db, files: {} }));
  }
}

export function resetDb() {
  db = fresh();
  if (canPersist()) sessionStorage.removeItem(STORAGE_KEY);
}

let counter = 0;
export const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}${(counter++).toString(36)}`;
