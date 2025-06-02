import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface User {
  id: number
  email: string
  created_at: string
  last_login?: string
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
      INSERT INTO users (email) 
      VALUES (${email}) 
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

  async updateLastLogin(userId: number): Promise<void> {
    await sql`
      UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ${userId}
    `
  },

  // File operations
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
