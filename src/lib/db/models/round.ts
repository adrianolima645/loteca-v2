import mongoose from 'mongoose'
import { baseSchemaOptions } from '../index'

export type RoundStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'RESULTS_PUBLISHED'
export type ScoringStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETE'
export type MatchOutcome = 'HOME_WIN' | 'DRAW' | 'AWAY_WIN'
export type LeagueValue = 'SERIE_A' | 'SERIE_B' | 'COPA_DO_BRASIL' | 'ESTADUAIS' | 'OTHER'

export interface IMatch {
  id: string
  homeTeam: string
  awayTeam: string
  league: LeagueValue
  outcome: MatchOutcome | null
  position: number
}

export interface IRound {
  id: string
  roundNumber: number
  status: RoundStatus
  scoringStatus: ScoringStatus
  openAt: Date
  closeAt: Date
  matches: IMatch[]
  createdAt: Date
  updatedAt: Date
}

type IMatchDoc = Omit<IMatch, 'id'>
type IRoundDoc = Omit<IRound, 'id'>

const matchSchema = new mongoose.Schema<IMatchDoc>(
  {
    homeTeam: { type: String, required: true },
    awayTeam: { type: String, required: true },
    league: {
      type: String,
      enum: ['SERIE_A', 'SERIE_B', 'COPA_DO_BRASIL', 'ESTADUAIS', 'OTHER'],
      required: true,
    },
    outcome: {
      type: String,
      enum: ['HOME_WIN', 'DRAW', 'AWAY_WIN', null],
      default: null,
    },
    position: { type: Number, required: true },
  },
  { _id: true }
)

const roundSchema = new mongoose.Schema<IRoundDoc>(
  {
    roundNumber: { type: Number, required: true, unique: true },
    status: {
      type: String,
      enum: ['DRAFT', 'OPEN', 'CLOSED', 'RESULTS_PUBLISHED'],
      required: true,
    },
    scoringStatus: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETE'],
      default: 'PENDING',
    },
    openAt: { type: Date, required: true },
    closeAt: { type: Date, required: true },
    matches: { type: [matchSchema], default: [] },
  },
  baseSchemaOptions
)

// Compound index for deadline queries (task 1.3)
roundSchema.index({ status: 1, closeAt: 1 })

export const RoundModel: mongoose.Model<IRoundDoc> =
  (mongoose.models.Round as mongoose.Model<IRoundDoc> | undefined) ??
  mongoose.model<IRoundDoc>('Round', roundSchema)
