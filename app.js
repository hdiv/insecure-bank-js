const createError = require('http-errors')
const cookieParser = require('cookie-parser')
const fs = require('fs')
const express = require('express')
const session = require('express-session')
const path = require('path')
const hbs = require('hbs')
const { Sequelize } = require('sequelize')

global.sequelize = new Sequelize('sqlite::memory:', {
    dialectOptions: {
        multipleStatements: true,
    },
    logging: process.env.SEQUELIZE_LOGGING === '1' || false
})

const createDb = async () => {
    const t = await sequelize.transaction()
    try {
        const statements = ['schema.sql', 'data.sql']
            .map((file) => path.join(__dirname, 'sql', file))
            .map((file) => fs.readFileSync(file, 'utf-8'))
            .flatMap((sql) =>
                sql
                    .split(';')
                    .map((sql) => sql.trim())
                    .filter((sql) => sql.length > 0)
            )
        for (let sql of statements) {
            await sequelize.query(sql, { transaction: t })
        }
        await t.commit()
    } catch (e) {
        await t.rollback()
        throw e
    }
}
createDb().catch((e) => console.error(e))

const loginRouter = require('./routes/login')
const dashboardRouter = require('./routes/dashboard')
const activityRouter = require('./routes/activity')
const transferRouter = require('./routes/transfer')
const adminRouter = require('./routes/admin')

const app = express()

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'hbs')
const helpers = {
    eq: (v1, v2) => v1 === v2,
    ne: (v1, v2) => v1 !== v2,
    lt: (v1, v2) => v1 < v2,
    gt: (v1, v2) => v1 > v2,
    lte: (v1, v2) => v1 <= v2,
    gte: (v1, v2) => v1 >= v2,
    and() {
        return Array.prototype.every.call(arguments, Boolean)
    },
    or() {
        return Array.prototype.slice.call(arguments, 0, -1).some(Boolean)
    },
    contains: (value, literal) => value.includes(literal),
    formatDate: (value) => {
        const date = new Date(value)
        return date.toLocaleString()
    },
}
Object.keys(helpers).forEach((name) =>
    hbs.handlebars.registerHelper(name, helpers[name])
)
hbs.registerPartials(path.join(__dirname, 'views', 'partials'))

app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))
app.use(
    session({
        secret: 'insecure-bank',
        resave: false,
        saveUninitialized: true,
    })
)

// logged users
app.use((req, res, next) => {
    if (req.session?.user != null || req.url.startsWith('/login')) {
        if (req.url.length <= 1) {
            res.redirect('/dashboard')
        } else {
            next()
        }
    } else {
        res.render('login')
    }
})

app.use('/login', loginRouter)
app.use('/dashboard', dashboardRouter)
app.use('/activity', activityRouter)
app.use('/transfer', transferRouter)
app.use('/admin', adminRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404))
})

// error handler
// eslint-disable-next-line no-unused-vars
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    // render the error page
    res.status(err.status || 500)
    res.render('error')
})

module.exports = app
