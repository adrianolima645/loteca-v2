/**
 * @jest-environment node
 */
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { betSlipRepository } from './betslip'
import { BetSlipModel } from '../db/models/betslip'

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

describe('betSlipRepository.upsert', () => {
  it('creates a new betslip', async () => {
    const userId = new mongoose.Types.ObjectId().toString()
    const roundId = new mongoose.Types.ObjectId().toString()

    const slip = await betSlipRepository.upsert({
      userId,
      roundId,
      selections: [{ matchId: new mongoose.Types.ObjectId().toString(), prediction: 'HOME_WIN' }],
    })

    expect(slip.userId).toBe(userId)
    expect(slip.roundId).toBe(roundId)
    expect(slip.selections).toHaveLength(1)
    expect(slip.status).toBe('PENDING_RESULTS')
  })

  it('replaces an existing betslip for the same (userId, roundId)', async () => {
    const userId = new mongoose.Types.ObjectId().toString()
    const roundId = new mongoose.Types.ObjectId().toString()

    await betSlipRepository.upsert({ userId, roundId, selections: [{ matchId: new mongoose.Types.ObjectId().toString(), prediction: 'HOME_WIN' }] })
    const updated = await betSlipRepository.upsert({ userId, roundId, selections: [{ matchId: new mongoose.Types.ObjectId().toString(), prediction: 'DRAW' }] })

    expect(updated.selections).toHaveLength(1)
    expect(updated.selections[0].prediction).toBe('DRAW')
    const count = await BetSlipModel.countDocuments({ userId, roundId })
    expect(count).toBe(1)
  })
})

describe('betSlipRepository.findByUserAndRound', () => {
  it('returns the betslip for the given (userId, roundId)', async () => {
    const userId = new mongoose.Types.ObjectId().toString()
    const roundId = new mongoose.Types.ObjectId().toString()

    await betSlipRepository.upsert({ userId, roundId, selections: [] })
    const slip = await betSlipRepository.findByUserAndRound(userId, roundId)

    expect(slip).not.toBeNull()
    expect(slip!.userId).toBe(userId)
  })

  it('returns null when no betslip exists', async () => {
    const slip = await betSlipRepository.findByUserAndRound(
      new mongoose.Types.ObjectId().toString(),
      new mongoose.Types.ObjectId().toString()
    )
    expect(slip).toBeNull()
  })
})

describe('betSlipRepository.findByRound', () => {
  it('returns all betslips for a round', async () => {
    const roundId = new mongoose.Types.ObjectId().toString()

    await betSlipRepository.upsert({ userId: new mongoose.Types.ObjectId().toString(), roundId, selections: [] })
    await betSlipRepository.upsert({ userId: new mongoose.Types.ObjectId().toString(), roundId, selections: [] })

    const slips = await betSlipRepository.findByRound(roundId)
    expect(slips).toHaveLength(2)
  })

  it('returns empty array when no slips exist for round', async () => {
    const slips = await betSlipRepository.findByRound(new mongoose.Types.ObjectId().toString())
    expect(slips).toHaveLength(0)
  })
})
