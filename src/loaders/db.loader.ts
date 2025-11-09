// Database bootstrapping with TypeORM
import { initializeDatabase } from '../config/db';

export const loadDatabase = async (): Promise<void> => {
  await initializeDatabase();
};
