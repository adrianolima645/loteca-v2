/**
 * @jest-environment node
 */
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import { ScoringRuleSetModel, UserRoundScoreModel, ChampionshipModel, ChampionshipStandingModel } from './scoring'

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

describe('ScoringRuleSetModel', () => {
  it('creates a rule set with league weights', async () => {
    const ruleSet = await ScoringRuleSetModel.create({
      championshipId: null,
      basePoints: 1,
      applyWeightOn: 'DRAW_ONLY',
      leagueWeights: [{ league: 'SERIE_A', multiplier: 1.5 }],
    })

    expect(ruleSet.basePoints).toBe(1)
    expect(ruleSet.applyWeightOn).toBe('DRAW_ONLY')
    expect(ruleSet.leagueWeights).toHaveLength(1)
    expect(ruleSet.leagueWeights[0].multiplier).toBe(1.5)
    expect(ruleSet.championshipId).toBeNull()
  })

  it('rejects invalid applyWeightOn value', async () => {
    await expect(
      ScoringRuleSetModel.create({ basePoints: 1, applyWeightOn: 'INVALID', leagueWeights: [] })
    ).rejects.toThrow()
  })

  it('rejects invalid league in leagueWeights', async () => {
    await expect(
      ScoringRuleSetModel.create({
        basePoints: 1,
        applyWeightOn: 'ALWAYS',
        leagueWeights: [{ league: 'UNKNOWN', multiplier: 2 }],
      })
    ).rejects.toThrow()
  })
})

describe('UserRoundScoreModel', () => {
  it('creates a user round score', async () => {
    const userId = new mongoose.Types.ObjectId()
    const roundId = new mongoose.Types.ObjectId()
    const championshipId = new mongoose.Types.ObjectId()

    const score = await UserRoundScoreModel.create({
      userId,
      roundId,
      championshipId,
      rawCorrectCount: 8,
      weightedPoints: 10.5,
    })

    expect(score.rawCorrectCount).toBe(8)
    expect(score.weightedPoints).toBe(10.5)
  })

  it('enforces unique compound index on (userId, roundId, championshipId)', async () => {
    const userId = new mongoose.Types.ObjectId()
    const roundId = new mongoose.Types.ObjectId()
    const championshipId = new mongoose.Types.ObjectId()

    await UserRoundScoreModel.create({ userId, roundId, championshipId, rawCorrectCount: 5, weightedPoints: 5 })

    await expect(
      UserRoundScoreModel.create({ userId, roundId, championshipId, rawCorrectCount: 7, weightedPoints: 7 })
    ).rejects.toThrow()
  })
})

describe('ChampionshipModel', () => {
  it('creates a championship', async () => {
    const champ = await ChampionshipModel.create({
      name: 'Liga 2026',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      status: 'ACTIVE',
      roundIds: [],
      scoringRuleSetId: null,
    })

    expect(champ.name).toBe('Liga 2026')
    expect(champ.status).toBe('ACTIVE')
    expect(champ.roundIds).toHaveLength(0)
    expect(champ.scoringRuleSetId).toBeNull()
  })

  it('rejects invalid status value', async () => {
    await expect(
      ChampionshipModel.create({
        name: 'X',
        startDate: new Date(),
        endDate: new Date(),
        status: 'INVALID',
        roundIds: [],
      })
    ).rejects.toThrow()
  })
})

describe('ChampionshipStandingModel', () => {
  it('creates a standing', async () => {
    const userId = new mongoose.Types.ObjectId()
    const championshipId = new mongoose.Types.ObjectId()

    const standing = await ChampionshipStandingModel.create({
      userId,
      championshipId,
      totalPoints: 42.5,
      roundsPlayed: 3,
      correctPredictions: 25,
      rank: 1,
      frozen: false,
    })

    expect(standing.totalPoints).toBe(42.5)
    expect(standing.rank).toBe(1)
    expect(standing.frozen).toBe(false)
  })

  it('enforces unique compound index on (championshipId, userId)', async () => {
    const userId = new mongoose.Types.ObjectId()
    const championshipId = new mongoose.Types.ObjectId()

    await ChampionshipStandingModel.create({ userId, championshipId, totalPoints: 10, roundsPlayed: 1, correctPredictions: 5, rank: 1, frozen: false })

    await expect(
      ChampionshipStandingModel.create({ userId, championshipId, totalPoints: 20, roundsPlayed: 2, correctPredictions: 10, rank: 1, frozen: false })
    ).rejects.toThrow()
  })

  it('toJSON exposes id and removes _id and __v', async () => {
    const standing = await ChampionshipStandingModel.create({
      userId: new mongoose.Types.ObjectId(),
      championshipId: new mongoose.Types.ObjectId(),
      totalPoints: 5,
      roundsPlayed: 1,
      correctPredictions: 3,
      rank: 2,
      frozen: false,
    })

    const json = standing.toJSON() as unknown as Record<string, unknown>
    expect(typeof json['id']).toBe('string')
    expect(json['_id']).toBeUndefined()
    expect(json['__v']).toBeUndefined()
  })
})
