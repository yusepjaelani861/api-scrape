const express = require('express')
const dotenv = require('dotenv')
const http = require('http')
const errorHandler = require('./middleware/error')
const router = require('./routes')
dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use('/', router)

app.use(errorHandler)

const server = http.createServer(app)
server.listen(port, () => {
    console.log(`Server running on port ${port}`)
})