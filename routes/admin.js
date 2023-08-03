const express = require('express')
const router = express.Router()
const { findUsersByUsername, findAllUsers } = require('../services/account')

router.get('/', async (req, res) => {
    const principal = req.session.user
    const accounts = await findUsersByUsername(principal.username)
    const allAccounts = await findAllUsers()
    res.render('admin', { account: accounts[0], accounts: allAccounts })
})

module.exports = router
