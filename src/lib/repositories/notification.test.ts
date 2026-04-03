/**
 * @jest-environment node
 */
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { notificationRepository } from './notification'

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

describe('notificationRepository.insertMany', () => {
  it('inserts multiple notifications', async () => {
    const userId1 = new mongoose.Types.ObjectId().toString()
    const userId2 = new mongoose.Types.ObjectId().toString()

    const result = await notificationRepository.insertMany([
      { userId: userId1, type: 'ROUND_OPENED', payload: '{"roundId":"r1"}' },
      { userId: userId2, type: 'ROUND_OPENED', payload: '{"roundId":"r1"}' },
    ])

    expect(result).toHaveLength(2)
    expect(result[0].type).toBe('ROUND_OPENED')
    expect(result[0].read).toBe(false)
  })
})

describe('notificationRepository.findUnreadByUser', () => {
  it('returns only unread notifications for the user', async () => {
    const userId = new mongoose.Types.ObjectId().toString()

    await notificationRepository.insertMany([
      { userId, type: 'ROUND_OPENED', payload: '{}' },
      { userId, type: 'RESULTS_PUBLISHED', payload: '{}' },
    ])

    const unread = await notificationRepository.findUnreadByUser(userId)
    expect(unread).toHaveLength(2)
    expect(unread.every(n => !n.read)).toBe(true)
  })

  it('excludes read notifications', async () => {
    const userId = new mongoose.Types.ObjectId().toString()

    const [n] = await notificationRepository.insertMany([
      { userId, type: 'ROUND_OPENED', payload: '{}' },
    ])
    await notificationRepository.markRead(n.id, userId)

    const unread = await notificationRepository.findUnreadByUser(userId)
    expect(unread).toHaveLength(0)
  })

  it('returns empty array when no notifications exist', async () => {
    const result = await notificationRepository.findUnreadByUser(new mongoose.Types.ObjectId().toString())
    expect(result).toHaveLength(0)
  })
})

describe('notificationRepository.markRead', () => {
  it('marks a notification as read', async () => {
    const userId = new mongoose.Types.ObjectId().toString()
    const [n] = await notificationRepository.insertMany([
      { userId, type: 'ROUND_CLOSING_SOON', payload: '{}' },
    ])

    await notificationRepository.markRead(n.id, userId)
    const unread = await notificationRepository.findUnreadByUser(userId)
    expect(unread).toHaveLength(0)
  })
})
