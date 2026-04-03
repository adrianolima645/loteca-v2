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

describe('userRepository.upsertByGoogleId', () => {
  it('creates a new user on first call', async () => {
    const { userRepository } = await import('./user')

    const user = await userRepository.upsertByGoogleId({
      googleId: 'g-new',
      email: 'new@example.com',
      name: 'New User',
      image: 'https://example.com/avatar.jpg',
    })

    expect(user.googleId).toBe('g-new')
    expect(user.email).toBe('new@example.com')
    expect(user.name).toBe('New User')
    expect(user.image).toBe('https://example.com/avatar.jpg')
    expect(user.role).toBe('USER')
  })

  it('updates name, email and image on subsequent call with same googleId', async () => {
    const { userRepository } = await import('./user')

    await userRepository.upsertByGoogleId({
      googleId: 'g-existing',
      email: 'old@example.com',
      name: 'Old Name',
    })

    const updated = await userRepository.upsertByGoogleId({
      googleId: 'g-existing',
      email: 'new@example.com',
      name: 'New Name',
      image: 'https://example.com/new.jpg',
    })

    expect(updated.email).toBe('new@example.com')
    expect(updated.name).toBe('New Name')
    expect(updated.image).toBe('https://example.com/new.jpg')
  })

  it('does not duplicate documents on repeated upserts', async () => {
    const { userRepository } = await import('./user')
    const { UserModel } = await import('../db/models/user')

    await userRepository.upsertByGoogleId({ googleId: 'g-dup', email: 'a@x.com', name: 'A' })
    await userRepository.upsertByGoogleId({ googleId: 'g-dup', email: 'b@x.com', name: 'B' })

    const count = await UserModel.countDocuments({ googleId: 'g-dup' })
    expect(count).toBe(1)
  })

  it('preserves existing role when upserting a returning user', async () => {
    const { userRepository } = await import('./user')
    const { UserModel } = await import('../db/models/user')

    const created = await userRepository.upsertByGoogleId({
      googleId: 'g-admin',
      email: 'admin@example.com',
      name: 'Admin',
    })
    // Simulate manual role elevation in DB
    await UserModel.updateOne({ _id: created.id }, { role: 'ADMIN' })

    const result = await userRepository.upsertByGoogleId({
      googleId: 'g-admin',
      email: 'admin@example.com',
      name: 'Admin',
    })

    expect(result.role).toBe('ADMIN')
  })
})

describe('userRepository.findById', () => {
  it('returns the user when the id exists', async () => {
    const { userRepository } = await import('./user')

    const created = await userRepository.upsertByGoogleId({
      googleId: 'g-findid',
      email: 'findid@example.com',
      name: 'FindById',
    })

    const found = await userRepository.findById(created.id)
    expect(found).not.toBeNull()
    expect(found!.googleId).toBe('g-findid')
  })

  it('returns null when the id does not exist', async () => {
    const { userRepository } = await import('./user')

    const result = await userRepository.findById(new mongoose.Types.ObjectId().toString())
    expect(result).toBeNull()
  })
})

describe('userRepository.findByEmail', () => {
  it('returns the user when the email exists', async () => {
    const { userRepository } = await import('./user')

    await userRepository.upsertByGoogleId({
      googleId: 'g-email',
      email: 'find@example.com',
      name: 'FindByEmail',
    })

    const found = await userRepository.findByEmail('find@example.com')
    expect(found).not.toBeNull()
    expect(found!.googleId).toBe('g-email')
  })

  it('returns null when the email does not exist', async () => {
    const { userRepository } = await import('./user')

    const result = await userRepository.findByEmail('nobody@example.com')
    expect(result).toBeNull()
  })
})
