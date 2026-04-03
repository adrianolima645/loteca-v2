import mongoose from 'mongoose'
import { UserModel, IUser } from '../db/models/user'

export interface UpsertUserInput {
  googleId: string
  email: string
  name: string
  image?: string | null
}

// lean() returns raw BSON — toJSON transform is not applied, so _id is not
// automatically mapped to id. This helper normalises every document coming
// out of the repository.
type RawDoc = Record<string, unknown> & { _id: mongoose.Types.ObjectId }

function toIUser(raw: RawDoc): IUser {
  const { _id, __v, ...rest } = raw
  return { ...rest, id: _id.toString() } as IUser
}

export const userRepository = {
  async upsertByGoogleId(input: UpsertUserInput): Promise<IUser> {
    const doc = await UserModel.findOneAndUpdate(
      { googleId: input.googleId },
      { $set: { email: input.email, name: input.name, image: input.image ?? null } },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true },
    ).lean()

    if (!doc) throw new Error('Upsert failed unexpectedly')
    return toIUser(doc as RawDoc)
  },

  async findById(id: string): Promise<IUser | null> {
    if (!mongoose.isValidObjectId(id)) return null
    const doc = await UserModel.findById(id).lean()
    return doc ? toIUser(doc as RawDoc) : null
  },

  async findByEmail(email: string): Promise<IUser | null> {
    const doc = await UserModel.findOne({ email }).lean()
    return doc ? toIUser(doc as RawDoc) : null
  },
}
