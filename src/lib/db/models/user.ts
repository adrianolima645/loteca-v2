import mongoose from 'mongoose'
import { baseSchemaOptions } from '../index'

export type UserRole = 'USER' | 'ADMIN'

/**
 * Public shape returned by the repository layer (lean documents).
 * `id` is a string mapped from `_id` by the toJSON transform in baseSchemaOptions.
 */
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

/**
 * Stored document shape — mirrors IUser but without the virtual `id` field
 * so that mongoose.Schema<IUserDoc> typechecks correctly against stored fields.
 */
type IUserDoc = Omit<IUser, 'id'>

const userSchema = new mongoose.Schema<IUserDoc>(
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

export const UserModel: mongoose.Model<IUserDoc> =
  (mongoose.models.User as mongoose.Model<IUserDoc> | undefined) ??
  mongoose.model<IUserDoc>('User', userSchema)
