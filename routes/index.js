const express = require('express')
const komikRoute = require('./v1/komiku')

const router = express.Router()

router.use('/komiku', komikRoute)

module.exports = router