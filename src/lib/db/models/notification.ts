import mongoose from 'mongoose'
import { baseSchemaOptions } from '../index'

export type NotificationEvent = 'ROUND_OPENED' | 'ROUND_CLOSING_SOON' | 'RESULTS_PUBLISHED'

export interface INotification {
  id: string
  userId: string
  type: NotificationEvent
  payload: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}

interface INotificationDoc {
  userId: mongoose.Types.ObjectId
  type: NotificationEvent
  payload: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}

const notificationSchema = new mongoose.Schema<INotificationDoc>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    type: {
      type: String,
      enum: ['ROUND_OPENED', 'ROUND_CLOSING_SOON', 'RESULTS_PUBLISHED'],
      required: true,
    },
    payload: { type: String, required: true, default: '{}' },
    read: { type: Boolean, required: true, default: false },
  },
  baseSchemaOptions
)

// Index for fetching unread notifications per user
notificationSchema.index({ userId: 1, read: 1 })

export const NotificationModel: mongoose.Model<INotificationDoc> =
  (mongoose.models.Notification as mongoose.Model<INotificationDoc> | undefined) ??
  mongoose.model<INotificationDoc>('Notification', notificationSchema)
