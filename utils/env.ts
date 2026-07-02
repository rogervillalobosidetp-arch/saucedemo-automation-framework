import * as dotenv from 'dotenv';

dotenv.config();

const toBool = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const toNumber = (value: string | undefined, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Configuración centralizada leída desde variables de entorno (.env).
 * Un único punto de verdad para toda la suite.
 */
export const env = {
  baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
  headless: toBool(process.env.HEADLESS, true),
  ci: toBool(process.env.CI, false),

  users: {
    standard: process.env.STANDARD_USER ?? 'standard_user',
    locked: process.env.LOCKED_USER ?? 'locked_out_user',
    problem: process.env.PROBLEM_USER ?? 'problem_user',
    performance: process.env.PERFORMANCE_USER ?? 'performance_glitch_user',
    password: process.env.USER_PASSWORD ?? 'secret_sauce',
  },

  lighthouse: {
    performance: toNumber(process.env.LH_PERFORMANCE, 80),
    accessibility: toNumber(process.env.LH_ACCESSIBILITY, 90),
    bestPractices: toNumber(process.env.LH_BEST_PRACTICES, 90),
    seo: toNumber(process.env.LH_SEO, 90),
  },
} as const;
