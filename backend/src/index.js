const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
if (process.env.NODE_ENV === 'development') {
  require('dotenv').config({ path: 'variables.dev.env' })
} else if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: 'variables.prod.env' })
}

const createServer = require('./createServer')
const db = require('./db')

const server = createServer()

server.express.use(cookieParser())

// JWT
server.express.use((req, res, next) => {
  const { token } = req.cookies
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET)
    req.userId = userId
  }
  next()
})

server.express.use(async (req, res, next) => {
  if (!req.userId) return next()
  const user = await db.query.user(
    { where: { id: req.userId } },
    '{ id, permissions, email, name }'
  )
  req.user = user
  next()
})

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL,
    },
  },
  deets => {
    console.log(`Server is now running on port http:/localhost:${deets.port}`)
  }
)
