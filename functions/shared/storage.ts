import { type User, type InsertUser } from "../../shared/schema";

// Cloudflare-compatible storage interface
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
}

// For Cloudflare Pages, we'll need to implement different storage strategies:
// 1. Cloudflare D1 (SQLite) for database storage
// 2. Durable Objects for more complex state management
// 3. KV storage for simple key-value operations

// Temporary in-memory storage for development/testing
// Note: This will not persist between function invocations in Cloudflare
export class CloudflareMemStorage implements IStorage {
  private static users: Map<string, User> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return CloudflareMemStorage.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(CloudflareMemStorage.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Generate UUID - using crypto.randomUUID() for Cloudflare compatibility
    const id = crypto.randomUUID();
    const user: User = { ...insertUser, id };
    CloudflareMemStorage.users.set(id, user);
    return user;
  }
}

// Factory function to get storage instance based on environment
export function getStorage(env?: any): IStorage {
  // For now, return memory storage
  // Later, this can be extended to return D1 storage when DATABASE_URL is available
  return new CloudflareMemStorage();
}