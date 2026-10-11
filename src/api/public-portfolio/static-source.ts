import { resolveLocalized } from './resolve-localized';
import { publicPortfolioSchema } from './schema';
import { portfolioSeed } from './seed/portfolio.seed';
import type { PortfolioSource } from './source';

export function createStaticSource(): PortfolioSource {
  return {
    async getPortfolio(lang) {
      const resolved = resolveLocalized(portfolioSeed, lang); // { es, en } → texto del idioma (RN-01)
      return publicPortfolioSchema.parse(resolved); // mismo contrato que la API
    },
  };
}
