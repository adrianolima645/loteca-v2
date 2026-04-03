/**
 * @jest-environment node
 */
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { NotificationModel } from './notification'

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

describe('NotificationModel schema', () => {
  it('creates a valid notification', async () => {
    const userId = new mongoose.Types.ObjectId()
    const n = await NotificationModel.create({
      userId,
      type: 'ROUND_OPENED',
      payload: JSON.stringify({ roundId: 'abc123' }),
      read: false,
    })

    expect(n.userId.toString()).toBe(userId.toString())
    expect(n.type).toBe('ROUND_OPENED')
    expect(n.read).toBe(false)
    expect(n.createdAt).toBeInstanceOf(Date)
  })

  it('defaults read to false', async () => {
    const n = await NotificationModel.create({
      userId: new mongoose.Types.ObjectId(),
      type: 'RESULTS_PUBLISHED',
      payload: '{}',
    })

    expect(n.read).toBe(false)
  })

  it('rejects invalid type value', async () => {
    await expect(
      NotificationModel.create({
        userId: new mongoose.Types.ObjectId(),
        type: 'INVALID_TYPE',
        payload: '{}',
      })
    ).rejects.toThrow()
  })

  it('toJSON exposes id and removes _id and __v', async () => {
    const n = await NotificationModel.create({
      userId: new mongoose.Types.ObjectId(),
      type: 'ROUND_CLOSING_SOON',
      payload: '{}',
    })

    const json = n.toJSON() as unknown as Record<string, unknown>
    expect(typeof json['id']).toBe('string')
    expect(json['_id']).toBeUndefined()
    expect(json['__v']).toBeUndefined()
  })
})
