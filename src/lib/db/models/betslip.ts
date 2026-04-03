import mongoose from 'mongoose'
import { baseSchemaOptions } from '../index'

export type BetSlipStatus = 'PENDING_RESULTS' | 'SCORED'
export type PredictionOutcome = 'HOME_WIN' | 'DRAW' | 'AWAY_WIN'

// Public interface — all IDs as strings
export interface IBetSlip {
  id: string
  userId: string
  roundId: string
  selections: Array<{ matchId: string; prediction: PredictionOutcome }>
  submittedAt: Date
  status: BetSlipStatus
  createdAt: Date
  updatedAt: Date
}

// Stored shape — ObjectId fields for Mongoose schema generic
interface IBetSlipDoc {
  userId: mongoose.Types.ObjectId
  roundId: mongoose.Types.ObjectId
  selections: Array<{ matchId: mongoose.Types.ObjectId; prediction: PredictionOutcome }>
  submittedAt: Date
  status: BetSlipStatus
  createdAt: Date
  updatedAt: Date
}

const betSelectionSchema = new mongoose.Schema<IBetSlipDoc['selections'][number]>(
  {
    matchId: { type: mongoose.Schema.Types.ObjectId, required: true },
    prediction: {
      type: String,
      enum: ['HOME_WIN', 'DRAW', 'AWAY_WIN'],
      required: true,
    },
  },
  { _id: false }
)

const betSlipSchema = new mongoose.Schema<IBetSlipDoc>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    roundId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Round' },
    selections: { type: [betSelectionSchema], default: [] },
    submittedAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['PENDING_RESULTS', 'SCORED'],
      required: true,
    },
  },
  baseSchemaOptions
)

// Unique compound index: one slip per (user, round)
betSlipSchema.index({ userId: 1, roundId: 1 }, { unique: true })
// Secondary index for querying all slips for a round
betSlipSchema.index({ roundId: 1 })

export const BetSlipModel: mongoose.Model<IBetSlipDoc> =
  (mongoose.models.BetSlip as mongoose.Model<IBetSlipDoc> | undefined) ??
  mongoose.model<IBetSlipDoc>('BetSlip', betSlipSchema)
