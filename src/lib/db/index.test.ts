/**
 * @jest-environment node
 */

describe('connectDB', () => {
  const mockConnect = jest.fn().mockResolvedValue(undefined)

  beforeEach(() => {
    jest.resetModules()
    mockConnect.mockClear()
    // Reset the global connection cache between tests
    delete (global as Record<string, unknown>)._mongooseConnection
    process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
  })

  afterEach(() => {
    delete process.env.MONGODB_URI
  })

  it('calls mongoose.connect when readyState is 0 (disconnected)', async () => {
    jest.doMock('mongoose', () => ({
      connect: mockConnect,
      connection: { readyState: 0 },
    }))
    const { connectDB } = await import('.')

    await connectDB()

    expect(mockConnect).toHaveBeenCalledTimes(1)
    expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost:27017/test')
  })

  it('does not call mongoose.connect when readyState is 1 (connected)', async () => {
    jest.doMock('mongoose', () => ({
      connect: mockConnect,
      connection: { readyState: 1 },
    }))
    const { connectDB } = await import('.')

    await connectDB()

    expect(mockConnect).not.toHaveBeenCalled()
  })

  it('reuses in-flight promise so connect is called only once for concurrent calls', async () => {
    jest.doMock('mongoose', () => ({
      connect: mockConnect,
      connection: { readyState: 0 },
    }))
    const { connectDB } = await import('.')

    await Promise.all([connectDB(), connectDB(), connectDB()])

    expect(mockConnect).toHaveBeenCalledTimes(1)
  })

  it('throws when MONGODB_URI is not defined', async () => {
    delete process.env.MONGODB_URI
    jest.doMock('mongoose', () => ({
      connect: mockConnect,
      connection: { readyState: 0 },
    }))
    const { connectDB } = await import('.')

    await expect(connectDB()).rejects.toThrow('MONGODB_URI is not defined')
  })
})

describe('baseSchemaOptions', () => {
  it('has timestamps enabled', async () => {
    const { baseSchemaOptions } = await import('.')
    expect(baseSchemaOptions.timestamps).toBe(true)
  })

  it('has a toJSON transform that converts _id to id string and removes __v', async () => {
    const { baseSchemaOptions } = await import('.')
    const transform = baseSchemaOptions.toJSON?.transform

    expect(typeof transform).toBe('function')

    const doc = {}
    const ret = { _id: { toString: () => 'abc123' }, __v: 0, name: 'test' }
    type TransformFn = (doc: object, ret: Record<string, unknown>) => Record<string, unknown>
    const result = (transform as TransformFn)(doc, ret)

    expect(result.id).toBe('abc123')
    expect(result._id).toBeUndefined()
    expect(result.__v).toBeUndefined()
    expect(result.name).toBe('test')
  })
})
