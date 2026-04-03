/**
 * @jest-environment node
 */
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { RoundModel } from './round'

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

describe('RoundModel schema', () => {
  it('creates a valid round with embedded matches', async () => {
    const round = await RoundModel.create({
      roundNumber: 1,
      status: 'DRAFT',
      openAt: new Date('2026-05-01'),
      closeAt: new Date('2026-05-08'),
      scoringStatus: 'PENDING',
      matches: [
        { homeTeam: 'Flamengo', awayTeam: 'Vasco', league: 'SERIE_A', position: 1 },
        { homeTeam: 'Santos', awayTeam: 'Palmeiras', league: 'SERIE_B', position: 2 },
      ],
    })

    expect(round.roundNumber).toBe(1)
    expect(round.status).toBe('DRAFT')
    expect(round.scoringStatus).toBe('PENDING')
    expect(round.matches).toHaveLength(2)
    expect(round.matches[0].homeTeam).toBe('Flamengo')
    expect(round.matches[0].outcome).toBeNull()
    expect(round.matches[0].position).toBe(1)
    expect(round.createdAt).toBeInstanceOf(Date)
  })

  it('defaults scoringStatus to PENDING when not provided', async () => {
    const round = await RoundModel.create({
      roundNumber: 2,
      status: 'DRAFT',
      openAt: new Date(),
      closeAt: new Date(),
      matches: [],
    })

    expect(round.scoringStatus).toBe('PENDING')
  })

  it('enforces unique roundNumber', async () => {
    await RoundModel.create({
      roundNumber: 42,
      status: 'DRAFT',
      openAt: new Date(),
      closeAt: new Date(),
      matches: [],
    })

    await expect(
      RoundModel.create({
        roundNumber: 42,
        status: 'DRAFT',
        openAt: new Date(),
        closeAt: new Date(),
        matches: [],
      })
    ).rejects.toThrow()
  })

  it('rejects invalid status value', async () => {
    await expect(
      RoundModel.create({
        roundNumber: 10,
        status: 'INVALID_STATUS',
        openAt: new Date(),
        closeAt: new Date(),
        matches: [],
      })
    ).rejects.toThrow()
  })

  it('rejects invalid scoringStatus value', async () => {
    await expect(
      RoundModel.create({
        roundNumber: 11,
        status: 'DRAFT',
        scoringStatus: 'INVALID',
        openAt: new Date(),
        closeAt: new Date(),
        matches: [],
      })
    ).rejects.toThrow()
  })

  it('rejects match with invalid league value', async () => {
    await expect(
      RoundModel.create({
        roundNumber: 20,
        status: 'DRAFT',
        openAt: new Date(),
        closeAt: new Date(),
        matches: [{ homeTeam: 'A', awayTeam: 'B', league: 'INVALID_LEAGUE', position: 1 }],
      })
    ).rejects.toThrow()
  })

  it('rejects match with invalid outcome value', async () => {
    await expect(
      RoundModel.create({
        roundNumber: 21,
        status: 'DRAFT',
        openAt: new Date(),
        closeAt: new Date(),
        matches: [
          {
            homeTeam: 'A',
            awayTeam: 'B',
            league: 'SERIE_A',
            position: 1,
            outcome: 'INVALID_OUTCOME',
          },
        ],
      })
    ).rejects.toThrow()
  })

  it('toJSON exposes id and removes _id and __v', async () => {
    const round = await RoundModel.create({
      roundNumber: 99,
      status: 'DRAFT',
      openAt: new Date(),
      closeAt: new Date(),
      matches: [],
    })

    const json = round.toJSON() as Record<string, unknown>
    expect(typeof json['id']).toBe('string')
    expect(json['_id']).toBeUndefined()
    expect(json['__v']).toBeUndefined()
  })

  it('queries by status and closeAt compound index', async () => {
    await RoundModel.create({
      roundNumber: 5,
      status: 'OPEN',
      openAt: new Date('2026-04-01'),
      closeAt: new Date('2026-04-08'),
      matches: [],
    })

    const open = await RoundModel.find({ status: 'OPEN', closeAt: { $gt: new Date('2026-04-01') } })
    expect(open).toHaveLength(1)
  })
})
