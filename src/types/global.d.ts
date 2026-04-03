import type mongoose from 'mongoose'

declare global {
  var _mongooseConnection: Promise<typeof mongoose> | undefined
}
