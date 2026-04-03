/**
 * @jest-environment node
 */
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongod: MongoMemoryServer

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongod.stop()
})

beforeEach(async () => {
  for (const col of Object.values(mongoose.connection.collections)) {
    await col.deleteMany({})
  }
})

describe('UserModel schema', () => {
  it('creates a user with all required fields and correct defaults', async () => {
    const { UserModel } = await import('./user')

    const user = await UserModel.create({
      googleId: 'google-001',
      email: 'alice@example.com',
      name: 'Alice',
    })

    expect(user.googleId).toBe('google-001')
    expect(user.email).toBe('alice@example.com')
    expect(user.name).toBe('Alice')
    expect(user.image).toBeNull()
    expect(user.role).toBe('USER')
    expect(user.emailNotificationsEnabled).toBe(true)
    expect(user.createdAt).toBeInstanceOf(Date)
    expect(user.updatedAt).toBeInstanceOf(Date)
  })

  it('toJSON transform exposes id string and removes _id and __v', async () => {
    const { UserModel } = await import('./user')

    const user = await UserModel.create({
      googleId: 'google-002',
      email: 'bob@example.com',
      name: 'Bob',
    })

    const json = user.toJSON() as Record<string, unknown>
    expect(typeof json['id']).toBe('string')
    expect(json._id).toBeUndefined()
    expect(json.__v).toBeUndefined()
  })

  it('rejects a second document with duplicate googleId', async () => {
    const { UserModel } = await import('./user')

    await UserModel.create({ googleId: 'dup-google', email: 'first@example.com', name: 'First' })

    await expect(
      UserModel.create({ googleId: 'dup-google', email: 'second@example.com', name: 'Second' })
    ).rejects.toThrow()
  })

  it('rejects a second document with duplicate email', async () => {
    const { UserModel } = await import('./user')

    await UserModel.create({ googleId: 'g-001', email: 'same@example.com', name: 'First' })

    await expect(
      UserModel.create({ googleId: 'g-002', email: 'same@example.com', name: 'Second' })
    ).rejects.toThrow()
  })

  it('rejects an invalid role value', async () => {
    const { UserModel } = await import('./user')

    await expect(
      UserModel.create({ googleId: 'g-003', email: 'c@example.com', name: 'C', role: 'SUPERUSER' })
    ).rejects.toThrow()
  })
})
