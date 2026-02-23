// Re-export prisma client singleton from lib
// This provides a config-level import path for the database client
export { default as prisma } from '../lib/prisma';
