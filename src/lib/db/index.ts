import mongoose from 'mongoose'

export async function connectDB(): Promise<typeof mongoose> {
  // Already connected — return immediately without opening a new connection
  if (mongoose.connection.readyState === 1) return mongoose

  // Reuse an in-flight connection promise (guards against concurrent calls
  // during Next.js hot-reload and serverless cold-start races)
  if (!global._mongooseConnection) {
    const uri = process.env.MONGODB_URI
    if (!uri) throw new Error('MONGODB_URI is not defined')
    global._mongooseConnection = mongoose.connect(uri)
  }

  return global._mongooseConnection
}

// Shared Mongoose schema options applied to every model in this project
export const baseSchemaOptions: mongoose.SchemaOptions = {
  timestamps: true,
  toJSON: {
    transform(_doc, ret: Record<string, unknown>) {
      ret.id = (ret._id as { toString(): string } | undefined)?.toString()
      delete ret._id
      delete ret.__v
      return ret
    },
  },
}
