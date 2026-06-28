import { eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users, InsertMessage, messages } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function saveUserProfile(userId: number, data: {
  name?: string;
  age?: number;
  gender?: string;
  avatar?: string;
  bio?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save user profile: database not available");
    return;
  }

  try {
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.age !== undefined) updateData.age = data.age;
    if (data.gender !== undefined) updateData.gender = data.gender;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.bio !== undefined) updateData.bio = data.bio;
    updateData.updatedAt = new Date();

    await db.update(users).set(updateData).where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to save user profile:", error);
    throw error;
  }
}

export async function getUsersByGender(gender: 'male' | 'female' | 'other') {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  try {
    return await db.select().from(users).where(eq(users.gender, gender));
  } catch (error) {
    console.error("[Database] Failed to get users by gender:", error);
    return [];
  }
}

export async function saveMessage(senderId: number, receiverId: number, content: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save message: database not available");
    return;
  }

  try {
    await db.insert(messages).values({ senderId, receiverId, content, isRead: false });
  } catch (error) {
    console.error("[Database] Failed to save message:", error);
    throw error;
  }
}

export async function getMessages(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get messages: database not available");
    return [];
  }

  try {
    return await db.select().from(messages).where(
      or(eq(messages.senderId, userId1), eq(messages.receiverId, userId1))
    );
  } catch (error) {
    console.error("[Database] Failed to get messages:", error);
    return [];
  }
}
