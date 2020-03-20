const express = require('express')

const app = express()
const sketchRouter = require('./router/sketch')

app.use(express.json())
app.use(sketchRouter)

module.exports = app
