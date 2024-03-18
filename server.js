require('dotenv').config()
const express = require('express')
const app = express()
const expressLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const PORT = process.env.BOOK_PORT || 3000
require('./dbConfig/config')
const getNewAccessToken = require('./middleware/getNewAccessToken')

app.use(cookieParser())
app.use(expressLayouts)
app.set('view engine', 'ejs')
app.set('views', 'views')
app.set('layout', 'layouts/layout')
app.use(methodOverride('_method'))
app.use(express.static('public'))
app.use(express.urlencoded({ limit: '10mb', extended: false }))

const bookRouter = require('./routes/bookRoutes')
const authenticate = require('./middleware/authMiddleware')

app.use(authenticate)

app.use((req, res, next) => {
    if (req.errorMessage === 'JsonWebTokenError') {
        res.redirect(`${process.env.AUTH_BASEURL}/auth/login`)
    }
    else if (req.errorMessage === 'TokenExpired') {
        // Apply getNewAccessToken middleware only when req.errorMessage is present
        getNewAccessToken(req, res, next);
    }
    else {
        // Skip getNewAccessToken middleware
        next();
    }
});

app.use('/books', bookRouter)

app.listen(PORT, () => {
    console.log(`Book service is running on port ${PORT}`)
})