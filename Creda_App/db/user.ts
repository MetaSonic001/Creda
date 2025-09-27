
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { SQLiteDatabase } from 'expo-sqlite';
import { users } from '~/store/schema';
import { v7 as uuidv7 } from 'uuid';
import 'react-native-get-random-values';
import { createStoreForUser, useUserStore } from '~/store/userStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as schema from "~/store/schema";

export async function signIn(expoDb: SQLiteDatabase, value: { email: string, password: string, name: string, id: string, last_synced: string, created_at: string, is_deleted: boolean }) {
  const db = drizzle(expoDb, { schema: schema });
  const userExists = await db.select().from(users).where(eq(users.id, value.id));
  if (userExists.length === 0) {
    await db.insert(users).values(value);
    const userStore = useUserStore(value.id);
    userStore.setState({
      user: {
        id: value.id,
        name: value.name,
        email: value.email,
        lastSynced: value.last_synced,
      },
    });
  }
}

export async function signUp(expoDb: SQLiteDatabase, value: { email: string, password: string, name: string, id: string, last_synced: string, created_at: string, is_deleted: boolean }) {
  const db = drizzle(expoDb);
  await db.insert(users).values(value);
  const userStore = useUserStore(value.id);
  userStore.setState({
    user: {
      id: value.id,
      name: value.name,
      email: value.email,
      lastSynced: value.last_synced,
    },
  });
}

export async function getUserById(expoDb: SQLiteDatabase, userId: string) {
  const db = drizzle(expoDb);
  const user = await db.select().from(users).where(eq(users.id, userId));
  return user.length > 0 ? user[0] : null;
}
