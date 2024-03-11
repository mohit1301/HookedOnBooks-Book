require('dotenv').config()
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_BOOKS_URL)
.then(()=>{
    console.log("connected to books database")
})
.catch((err)=>{
    console.log(err)
})
