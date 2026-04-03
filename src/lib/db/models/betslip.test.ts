/**
 * @jest-environment node
 */
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { BetSlipModel } from './betslip'

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

const userId = new mongoose.Types.ObjectId()
const roundId = new mongoose.Types.ObjectId()

describe('BetSlipModel schema', () => {
  it('creates a valid betslip with embedded selections', async () => {
    const matchId = new mongoose.Types.ObjectId()
    const slip = await BetSlipModel.create({
      userId,
      roundId,
      selections: [{ matchId, prediction: 'HOME_WIN' }],
      submittedAt: new Date(),
      status: 'PENDING_RESULTS',
    })

    expect(slip.userId.toString()).toBe(userId.toString())
    expect(slip.roundId.toString()).toBe(roundId.toString())
    expect(slip.selections).toHaveLength(1)
    expect(slip.selections[0].prediction).toBe('HOME_WIN')
    expect(slip.status).toBe('PENDING_RESULTS')
    expect(slip.createdAt).toBeInstanceOf(Date)
  })

  it('enforces unique compound index on (userId, roundId)', async () => {
    await BetSlipModel.create({ userId, roundId, selections: [], submittedAt: new Date(), status: 'PENDING_RESULTS' })

    await expect(
      BetSlipModel.create({ userId, roundId, selections: [], submittedAt: new Date(), status: 'PENDING_RESULTS' })
    ).rejects.toThrow()
  })

  it('allows same userId with different roundId', async () => {
    const roundId2 = new mongoose.Types.ObjectId()
    await BetSlipModel.create({ userId, roundId, selections: [], submittedAt: new Date(), status: 'PENDING_RESULTS' })
    const slip2 = await BetSlipModel.create({ userId, roundId: roundId2, selections: [], submittedAt: new Date(), status: 'PENDING_RESULTS' })
    expect(slip2.roundId.toString()).toBe(roundId2.toString())
  })

  it('rejects invalid status value', async () => {
    await expect(
      BetSlipModel.create({
        userId,
        roundId: new mongoose.Types.ObjectId(),
        selections: [],
        submittedAt: new Date(),
        status: 'INVALID_STATUS',
      })
    ).rejects.toThrow()
  })

  it('rejects invalid prediction value in selection', async () => {
    await expect(
      BetSlipModel.create({
        userId,
        roundId: new mongoose.Types.ObjectId(),
        selections: [{ matchId: new mongoose.Types.ObjectId(), prediction: 'INVALID' }],
        submittedAt: new Date(),
        status: 'PENDING_RESULTS',
      })
    ).rejects.toThrow()
  })

  it('toJSON exposes id and removes _id and __v', async () => {
    const slip = await BetSlipModel.create({
      userId,
      roundId: new mongoose.Types.ObjectId(),
      selections: [],
      submittedAt: new Date(),
      status: 'PENDING_RESULTS',
    })

    const json = slip.toJSON() as unknown as Record<string, unknown>
    expect(typeof json['id']).toBe('string')
    expect(json['_id']).toBeUndefined()
    expect(json['__v']).toBeUndefined()
  })

  it('finds betslips by roundId index', async () => {
    await BetSlipModel.create({ userId, roundId, selections: [], submittedAt: new Date(), status: 'PENDING_RESULTS' })
    const results = await BetSlipModel.find({ roundId })
    expect(results).toHaveLength(1)
  })
})
