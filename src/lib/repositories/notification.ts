import mongoose from 'mongoose'
import { NotificationModel, INotification } from '../db/models/notification'

export interface InsertNotificationInput {
  userId: string
  type: INotification['type']
  payload: string
}

type RawDoc = { _id: mongoose.Types.ObjectId } & Omit<INotification, 'id'>

function toINotification(raw: RawDoc): INotification {
  const { _id, ...rest } = raw
  return { ...rest, id: _id.toString() }
}

export const notificationRepository = {
  async insertMany(inputs: InsertNotificationInput[]): Promise<INotification[]> {
    const docs = await NotificationModel.insertMany(
      inputs.map(i => ({ ...i, userId: new mongoose.Types.ObjectId(i.userId) })),
    )
    return docs.map(d => toINotification(d.toObject() as unknown as RawDoc))
  },

  async findUnreadByUser(userId: string): Promise<INotification[]> {
    if (!mongoose.isValidObjectId(userId)) return []
    const docs = await NotificationModel.find({
      userId: new mongoose.Types.ObjectId(userId),
      read: false,
    }).lean()
    return docs.map(d => toINotification(d as unknown as RawDoc))
  },

  async markRead(id: string, userId: string): Promise<void> {
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(userId)) return
    await NotificationModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), userId: new mongoose.Types.ObjectId(userId) },
      { $set: { read: true } },
    )
  },
}
