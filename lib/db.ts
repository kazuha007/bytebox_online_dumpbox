import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: number
  email: string
  created_at: string
  last_login?: string
  password_hash?: string
  password_set: boolean
  failed_login_attempts: number
  lockout_until?: string
  last_password_change?: string
}

export interface FileRecord {
  id: number
  user_id: number
  filename: string
  original_filename: string
  size: number
  mimetype: string
  storage_url: string
  created_at: string
  updated_at: string
  is_deleted: boolean
}

export const db = {
  // User operations
  async createUser(email: string): Promise<User> {
    const result = await sql`
      INSERT INTO users (email, password_set, failed_login_attempts) 
      VALUES (${email}, false, 0) 
      ON CONFLICT (email) DO UPDATE SET last_login = CURRENT_TIMESTAMP
      RETURNING *
    `
    return result[0] as User
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `
    return (result[0] as User) || null
  },

  async setUserPassword(userId: number, passwordHash: string): Promise<void> {
    await sql`
      UPDATE users 
      SET password_hash = ${passwordHash}, 
          password_set = true, 
          last_password_change = CURRENT_TIMESTAMP,
          failed_login_attempts = 0,
          lockout_until = NULL
      WHERE id = ${userId}
    `
  },

  async updatePassword(userId: number, passwordHash: string): Promise<void> {
    await sql`
      UPDATE users 
      SET password_hash = ${passwordHash}, 
          last_password_change = CURRENT_TIMESTAMP,
          failed_login_attempts = 0
      WHERE id = ${userId}
    `
  },

  async incrementFailedAttempts(userId: number): Promise<void> {
    await sql`
      UPDATE users 
      SET failed_login_attempts = failed_login_attempts + 1
      WHERE id = ${userId}
    `
  },

  async lockAccount(userId: number): Promise<void> {
    const lockoutTime = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    await sql`
      UPDATE users 
      SET lockout_until = ${lockoutTime.toISOString()},
          failed_login_attempts = 0
      WHERE id = ${userId}
    `
  },

  async resetFailedAttempts(userId: number): Promise<void> {
    await sql`
      UPDATE users 
      SET failed_login_attempts = 0,
          lockout_until = NULL
      WHERE id = ${userId}
    `
  },

  async updateLastLogin(userId: number): Promise<void> {
    await sql`
      UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ${userId}
    `
  },

  async isAccountLocked(userId: number): Promise<boolean> {
    const result = await sql`
      SELECT lockout_until FROM users WHERE id = ${userId}
    `
    const user = result[0] as { lockout_until?: string }

    if (!user?.lockout_until) return false

    const lockoutTime = new Date(user.lockout_until)
    const now = new Date()

    if (now < lockoutTime) {
      return true
    } else {
      // Lockout period has expired, clear it
      await this.resetFailedAttempts(userId)
      return false
    }
  },

  // File operations (unchanged)
  async createFile(
    userId: number,
    filename: string,
    originalFilename: string,
    size: number,
    mimetype: string,
    storageUrl: string,
  ): Promise<FileRecord> {
    const result = await sql`
      INSERT INTO files (user_id, filename, original_filename, size, mimetype, storage_url)
      VALUES (${userId}, ${filename}, ${originalFilename}, ${size}, ${mimetype}, ${storageUrl})
      RETURNING *
    `
    return result[0] as FileRecord
  },

  async getUserFiles(userId: number): Promise<FileRecord[]> {
    const result = await sql`
      SELECT * FROM files 
      WHERE user_id = ${userId} AND is_deleted = false 
      ORDER BY created_at DESC
    `
    return result as FileRecord[]
  },

  async deleteFile(fileId: number, userId: number): Promise<boolean> {
    const result = await sql`
      UPDATE files 
      SET is_deleted = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${fileId} AND user_id = ${userId}
      RETURNING *
    `
    return result.length > 0
  },

  async getFile(fileId: number, userId: number): Promise<FileRecord | null> {
    const result = await sql`
      SELECT * FROM files 
      WHERE id = ${fileId} AND user_id = ${userId} AND is_deleted = false
    `
    return (result[0] as FileRecord) || null
  },
}
