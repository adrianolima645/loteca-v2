export {}

declare global {
  var _mongooseConnection: Promise<import('mongoose')> | undefined
}
