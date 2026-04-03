import mongoose from 'mongoose'
import { baseSchemaOptions } from '../index'

export type UserRole = 'USER' | 'ADMIN'

export interface IUser {
  id: string
  googleId: string
  email: string
  name: string
  image: string | null
  role: UserRole
  emailNotificationsEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema<IUser>(
  {
    googleId: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    name:     { type: String, required: true },
    image:    { type: String, default: null },
    role:     { type: String, enum: ['USER', 'ADMIN'] as const, default: 'USER' },
    emailNotificationsEnabled: { type: Boolean, default: true },
  },
  baseSchemaOptions,
)

export const UserModel =
  (mongoose.models.User as mongoose.Model<IUser> | undefined) ??
  mongoose.model<IUser>('User', userSchema)
