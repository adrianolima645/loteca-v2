import mongoose from 'mongoose'
import { baseSchemaOptions } from '../index'
export type LeagueValue = 'SERIE_A' | 'SERIE_B' | 'COPA_DO_BRASIL' | 'ESTADUAIS' | 'OTHER'
export type ApplyWeightOn = 'DRAW_ONLY' | 'ALWAYS'
export type ChampionshipStatus = 'ACTIVE' | 'CLOSED'

// ─── ScoringRuleSet ────────────────────────────────────────────────────────

interface ILeagueWeight {
  league: LeagueValue
  multiplier: number
}

interface IScoringRuleSetDoc {
  championshipId: mongoose.Types.ObjectId | null
  basePoints: number
  applyWeightOn: ApplyWeightOn
  leagueWeights: ILeagueWeight[]
  createdAt: Date
  updatedAt: Date
}

const leagueWeightSchema = new mongoose.Schema<ILeagueWeight>(
  {
    league: {
      type: String,
      enum: ['SERIE_A', 'SERIE_B', 'COPA_DO_BRASIL', 'ESTADUAIS', 'OTHER'],
      required: true,
    },
    multiplier: { type: Number, required: true },
  },
  { _id: false }
)

const scoringRuleSetSchema = new mongoose.Schema<IScoringRuleSetDoc>(
  {
    championshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Championship', default: null },
    basePoints: { type: Number, required: true, default: 1 },
    applyWeightOn: { type: String, enum: ['DRAW_ONLY', 'ALWAYS'], required: true },
    leagueWeights: { type: [leagueWeightSchema], default: [] },
  },
  baseSchemaOptions
)

export const ScoringRuleSetModel: mongoose.Model<IScoringRuleSetDoc> =
  (mongoose.models.ScoringRuleSet as mongoose.Model<IScoringRuleSetDoc> | undefined) ??
  mongoose.model<IScoringRuleSetDoc>('ScoringRuleSet', scoringRuleSetSchema)

// ─── UserRoundScore ────────────────────────────────────────────────────────

interface IUserRoundScoreDoc {
  userId: mongoose.Types.ObjectId
  roundId: mongoose.Types.ObjectId
  championshipId: mongoose.Types.ObjectId
  rawCorrectCount: number
  weightedPoints: number
  createdAt: Date
  updatedAt: Date
}

const userRoundScoreSchema = new mongoose.Schema<IUserRoundScoreDoc>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    roundId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Round' },
    championshipId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Championship' },
    rawCorrectCount: { type: Number, required: true },
    weightedPoints: { type: Number, required: true },
  },
  baseSchemaOptions
)

// Unique: one score per (user, round, championship); replaced on recalculation
userRoundScoreSchema.index({ userId: 1, roundId: 1, championshipId: 1 }, { unique: true })
userRoundScoreSchema.index({ championshipId: 1 })

export const UserRoundScoreModel: mongoose.Model<IUserRoundScoreDoc> =
  (mongoose.models.UserRoundScore as mongoose.Model<IUserRoundScoreDoc> | undefined) ??
  mongoose.model<IUserRoundScoreDoc>('UserRoundScore', userRoundScoreSchema)

// ─── Championship ──────────────────────────────────────────────────────────

interface IChampionshipDoc {
  name: string
  startDate: Date
  endDate: Date
  status: ChampionshipStatus
  roundIds: mongoose.Types.ObjectId[]
  scoringRuleSetId: mongoose.Types.ObjectId | null
  createdAt: Date
  updatedAt: Date
}

const championshipSchema = new mongoose.Schema<IChampionshipDoc>(
  {
    name: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['ACTIVE', 'CLOSED'], required: true },
    roundIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    scoringRuleSetId: { type: mongoose.Schema.Types.ObjectId, ref: 'ScoringRuleSet', default: null },
  },
  baseSchemaOptions
)

export const ChampionshipModel: mongoose.Model<IChampionshipDoc> =
  (mongoose.models.Championship as mongoose.Model<IChampionshipDoc> | undefined) ??
  mongoose.model<IChampionshipDoc>('Championship', championshipSchema)

// ─── ChampionshipStanding ─────────────────────────────────────────────────

interface IChampionshipStandingDoc {
  userId: mongoose.Types.ObjectId
  championshipId: mongoose.Types.ObjectId
  totalPoints: number
  roundsPlayed: number
  correctPredictions: number
  rank: number
  frozen: boolean
  createdAt: Date
  updatedAt: Date
}

const championshipStandingSchema = new mongoose.Schema<IChampionshipStandingDoc>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    championshipId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Championship' },
    totalPoints: { type: Number, required: true, default: 0 },
    roundsPlayed: { type: Number, required: true, default: 0 },
    correctPredictions: { type: Number, required: true, default: 0 },
    rank: { type: Number, required: true },
    frozen: { type: Boolean, required: true, default: false },
  },
  baseSchemaOptions
)

// Leaderboard query index
championshipStandingSchema.index({ championshipId: 1, rank: 1 })
// Unique: one standing per (championship, user)
championshipStandingSchema.index({ championshipId: 1, userId: 1 }, { unique: true })

export const ChampionshipStandingModel: mongoose.Model<IChampionshipStandingDoc> =
  (mongoose.models.ChampionshipStanding as mongoose.Model<IChampionshipStandingDoc> | undefined) ??
  mongoose.model<IChampionshipStandingDoc>('ChampionshipStanding', championshipStandingSchema)
