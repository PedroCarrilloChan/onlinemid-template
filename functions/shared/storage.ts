import { type User, type InsertUser } from "../../shared/schema";

// Password hashing utilities using Web Crypto API (Workers-compatible)
export class PasswordHash {
  private static async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // OWASP recommended minimum
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );
  }

  static async hashPassword(password: string): Promise<string> {
    // Generate random salt
    const salt = crypto.getRandomValues(new Uint8Array(32));
    
    // Derive key using PBKDF2
    const key = await this.deriveKey(password, salt);
    
    // Export the key as raw bytes
    const keyBytes = await crypto.subtle.exportKey('raw', key);
    
    // Combine salt + hash for storage
    const combined = new Uint8Array(salt.length + keyBytes.byteLength);
    combined.set(salt);
    combined.set(new Uint8Array(keyBytes), salt.length);
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  }

  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      // Decode from base64
      const combined = new Uint8Array(
        atob(hashedPassword).split('').map(char => char.charCodeAt(0))
      );
      
      // Extract salt and hash
      const salt = combined.slice(0, 32);
      const storedHash = combined.slice(32);
      
      // Derive key with same salt
      const key = await this.deriveKey(password, salt);
      const keyBytes = await crypto.subtle.exportKey('raw', key);
      const derivedHash = new Uint8Array(keyBytes);
      
      // Constant-time comparison
      if (storedHash.length !== derivedHash.length) return false;
      
      let result = 0;
      for (let i = 0; i < storedHash.length; i++) {
        result |= storedHash[i] ^ derivedHash[i];
      }
      
      return result === 0;
    } catch {
      return false;
    }
  }
}

// Safe user type without password for API responses
export type SafeUser = Omit<User, 'password'>;

// Cloudflare-compatible storage interface
export interface IStorage {
  getUser(id: string): Promise<SafeUser | undefined>;
  getUserByUsername(username: string): Promise<SafeUser | undefined>;
  createUser(user: InsertUser): Promise<SafeUser>;
  // Private method for internal password verification
  verifyPassword(username: string, password: string): Promise<SafeUser | null>;
}

// Cloudflare D1 Database storage implementation
export class CloudflareD1Storage implements IStorage {
  constructor(private db: any) {} // D1Database type

  async getUser(id: string): Promise<SafeUser | undefined> {
    try {
      const result = await this.db
        .prepare("SELECT id, username FROM users WHERE id = ?")
        .bind(id)
        .first();
      
      return result ? (result as SafeUser) : undefined;
    } catch (error) {
      console.error('D1 getUser error:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<SafeUser | undefined> {
    try {
      const result = await this.db
        .prepare("SELECT id, username FROM users WHERE username = ?")
        .bind(username)
        .first();
      
      return result ? (result as SafeUser) : undefined;
    } catch (error) {
      console.error('D1 getUserByUsername error:', error);
      return undefined;
    }
  }

  // Private method to get user with password for verification
  private async getUserWithPassword(username: string): Promise<User | undefined> {
    try {
      const result = await this.db
        .prepare("SELECT id, username, password FROM users WHERE username = ?")
        .bind(username)
        .first();
      
      return result ? (result as User) : undefined;
    } catch (error) {
      console.error('D1 getUserWithPassword error:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<SafeUser> {
    try {
      // Check if username already exists first (more explicit)
      const existingUser = await this.getUserWithPassword(insertUser.username);
      if (existingUser) {
        throw new Error('Username already exists');
      }

      // Hash the password before storage
      const passwordHash = await PasswordHash.hashPassword(insertUser.password);
      const id = crypto.randomUUID();
      
      // Try to insert the user
      const result = await this.db
        .prepare("INSERT INTO users (id, username, password) VALUES (?, ?, ?)")
        .bind(id, insertUser.username, passwordHash)
        .run();
      
      if (!result.success) {
        throw new Error('Failed to create user');
      }
      
      // Return safe user without password
      const safeUser: SafeUser = { 
        id, 
        username: insertUser.username
      };
      
      return safeUser;
    } catch (error: any) {
      // Handle unique constraint violation
      if (error.message?.includes('UNIQUE constraint failed') || error.message === 'Username already exists') {
        throw new Error('Username already exists');
      }
      
      console.error('D1 createUser error:', error);
      throw new Error('Failed to create user');
    }
  }

  // Verify password for authentication
  async verifyPassword(username: string, password: string): Promise<SafeUser | null> {
    try {
      const user = await this.getUserWithPassword(username);
      if (!user) return null;
      
      const isValid = await PasswordHash.verifyPassword(password, user.password);
      if (isValid) {
        // Return safe user without password
        return { id: user.id, username: user.username };
      }
      return null;
    } catch (error) {
      console.error('D1 verifyPassword error:', error);
      return null;
    }
  }
}

// Cloudflare KV storage implementation (NOT recommended for production user data)
// KV is eventually consistent and not suitable for authoritative user records
// Use D1 for production; this is for development/demo only
export class CloudflareKVStorage implements IStorage {
  constructor(
    private usersKV: any, // KVNamespace type
    private usernameIndexKV: any // KVNamespace type for username->id mapping
  ) {}

  async getUser(id: string): Promise<SafeUser | undefined> {
    try {
      const userData = await this.usersKV.get(`user:${id}`, 'json');
      if (!userData) return undefined;
      
      const user = userData as User;
      // Return safe user without password
      return { id: user.id, username: user.username };
    } catch (error) {
      console.error('KV getUser error:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<SafeUser | undefined> {
    try {
      // First get the user ID from the username index
      const userId = await this.usernameIndexKV.get(`username:${username}`);
      if (!userId) return undefined;
      
      return this.getUser(userId);
    } catch (error) {
      console.error('KV getUserByUsername error:', error);
      return undefined;
    }
  }

  // Private method to get user with password for verification
  private async getUserWithPassword(username: string): Promise<User | undefined> {
    try {
      const userId = await this.usernameIndexKV.get(`username:${username}`);
      if (!userId) return undefined;
      
      const userData = await this.usersKV.get(`user:${userId}`, 'json');
      return userData ? (userData as User) : undefined;
    } catch (error) {
      console.error('KV getUserWithPassword error:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Check if username already exists (best effort, not atomic)
      const existingUserId = await this.usernameIndexKV.get(`username:${insertUser.username}`);
      if (existingUserId) {
        throw new Error('Username already exists');
      }
      
      // Hash the password before storage
      const passwordHash = await PasswordHash.hashPassword(insertUser.password);
      const id = crypto.randomUUID();
      const user: User = { 
        id, 
        username: insertUser.username, 
        password: passwordHash 
      };
      
      // Store username->id mapping first (for uniqueness check)
      await this.usernameIndexKV.put(`username:${user.username}`, id);
      
      // Store user data
      await this.usersKV.put(`user:${id}`, JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      console.error('KV createUser error:', error);
      if (error.message === 'Username already exists') {
        throw error;
      }
      throw new Error('Failed to create user');
    }
  }

  // Verify password for authentication
  async verifyPassword(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.getUserByUsername(username);
      if (!user) return null;
      
      const isValid = await PasswordHash.verifyPassword(password, user.password);
      return isValid ? user : null;
    } catch (error) {
      console.error('KV verifyPassword error:', error);
      return null;
    }
  }
}

// Development in-memory storage (non-persistent)
// Note: This will not persist between function invocations in Cloudflare
// DEMO ONLY - NOT for production use
export class CloudflareMemStorage implements IStorage {
  private static users: Map<string, User> = new Map();
  private static usernameIndex: Map<string, string> = new Map(); // username -> id

  async getUser(id: string): Promise<User | undefined> {
    return CloudflareMemStorage.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const userId = CloudflareMemStorage.usernameIndex.get(username);
    if (!userId) return undefined;
    return CloudflareMemStorage.users.get(userId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      // Check for existing username
      if (CloudflareMemStorage.usernameIndex.has(insertUser.username)) {
        throw new Error('Username already exists');
      }
      
      // Hash password (even in demo for consistency)
      const passwordHash = await PasswordHash.hashPassword(insertUser.password);
      const id = crypto.randomUUID();
      const user: User = { 
        id, 
        username: insertUser.username, 
        password: passwordHash 
      };
      
      // Store user and index
      CloudflareMemStorage.users.set(id, user);
      CloudflareMemStorage.usernameIndex.set(user.username, id);
      
      return user;
    } catch (error: any) {
      if (error.message === 'Username already exists') {
        throw error;
      }
      throw new Error('Failed to create user');
    }
  }

  // Verify password for authentication
  async verifyPassword(username: string, password: string): Promise<User | null> {
    try {
      const user = await this.getUserByUsername(username);
      if (!user) return null;
      
      const isValid = await PasswordHash.verifyPassword(password, user.password);
      return isValid ? user : null;
    } catch (error) {
      console.error('Mem verifyPassword error:', error);
      return null;
    }
  }
}

// Factory function to get storage instance based on environment
export function getStorage(env?: any): IStorage {
  // PRODUCTION: Check for Cloudflare D1 database (RECOMMENDED)
  if (env?.DB) {
    console.log('Using D1 storage');
    return new CloudflareD1Storage(env.DB);
  }
  
  // DEVELOPMENT: Check for Cloudflare KV namespaces (NOT RECOMMENDED for production)
  if (env?.USERS_KV && env?.USERNAME_INDEX_KV) {
    console.log('Using KV storage (development only)');
    return new CloudflareKVStorage(env.USERS_KV, env.USERNAME_INDEX_KV);
  }
  
  // FALLBACK: In-memory storage for development (DEMO ONLY)
  console.log('Using memory storage (demo only)');
  return new CloudflareMemStorage();
}