const express = require('express')
const router = express.Router()
const { findUsersByUsernameAndPassword } = require('../services/account')

router.post('/', async (req, res) => {
    const accounts = await findUsersByUsernameAndPassword(
        req.body.username,
        req.body.password
    )
    if (accounts.length === 0) {
        res.render('login', { authenticationFailure: true })
    } else {
        const account = accounts[0]
        const roles =
            account.username === 'john' ? ['ROLE_ADMIN'] : ['ROLE_USER']
        req.session.user = Object.assign({ roles: roles }, account)
        req.session.save()
        res.redirect('/dashboard')
    }
})

router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

module.exports = router
