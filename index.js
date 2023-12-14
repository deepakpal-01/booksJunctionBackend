const { config } = require('dotenv')
const express=require('express')
var cors = require('cors')
const app=express()
const port=4000


app.use(express.json())
app.use(cors())


app.use('/',require('./Routes/Home'))
app.use('/auth',require('./Routes/Auth'))
app.use('/books',require('./Routes/Books'))

  
app.listen(port, () => {
    console.log(`BooksBackend app listening on port 127.0.0.1:${port}`)
  })