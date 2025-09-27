import { useSQLiteContext } from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';

export function useDrizzle() {
  const expoDb = useSQLiteContext();
  return drizzle(expoDb);
}


