import mongoose from 'mongoose'
import { BetSlipModel, type IBetSlip, type PredictionOutcome } from '../db/models/betslip'

export interface UpsertBetSlipInput {
  userId: string
  roundId: string
  selections: Array<{ matchId: string; prediction: PredictionOutcome }>
}

// lean() returns raw BSON — map _id → id manually
type RawBetSlip = {
  _id: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  roundId: mongoose.Types.ObjectId
  selections: Array<{ matchId: mongoose.Types.ObjectId; prediction: PredictionOutcome }>
  submittedAt: Date
  status: IBetSlip['status']
  createdAt: Date
  updatedAt: Date
}

function toIBetSlip(raw: RawBetSlip): IBetSlip {
  const { _id, userId, roundId, selections, ...rest } = raw
  return {
    ...rest,
    id: _id.toString(),
    userId: userId.toString(),
    roundId: roundId.toString(),
    selections: selections.map(s => ({
      matchId: s.matchId.toString(),
      prediction: s.prediction,
    })),
  }
}

export const betSlipRepository = {
  /**
   * Callers must ensure connectDB() has been awaited before calling.
   * Atomically replaces the full BetSlip for (userId, roundId) — upsert semantics.
   */
  async upsert(input: UpsertBetSlipInput): Promise<IBetSlip> {
    const now = new Date()
    const doc = await BetSlipModel.findOneAndUpdate(
      { userId: input.userId, roundId: input.roundId },
      {
        $set: {
          selections: input.selections.map(s => ({
            matchId: new mongoose.Types.ObjectId(s.matchId),
            prediction: s.prediction,
          })),
          submittedAt: now,
          status: 'PENDING_RESULTS',
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    ).lean()

    if (!doc) throw new Error('BetSlip upsert failed unexpectedly')
    return toIBetSlip(doc as unknown as RawBetSlip)
  },

  async findByUserAndRound(userId: string, roundId: string): Promise<IBetSlip | null> {
    const doc = await BetSlipModel.findOne({ userId, roundId }).lean()
    return doc ? toIBetSlip(doc as unknown as RawBetSlip) : null
  },

  async findByRound(roundId: string): Promise<IBetSlip[]> {
    const docs = await BetSlipModel.find({ roundId }).lean()
    return docs.map(d => toIBetSlip(d as unknown as RawBetSlip))
  },
}
