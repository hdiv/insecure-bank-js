const express = require('express')
const router = express.Router()
const { findUsersByUsername } = require('../services/account')
const { findCashAccountsByUsername } = require('../services/cashAccount')
const { findTransactionsByCashAccountNumber } = require('../services/activity')

const fetchParameters = async (principal, number = null) => {
    const accounts = await findUsersByUsername(principal.username)
    const cashAccounts = await findCashAccountsByUsername(principal.username)
    const accountNumber = number == null ? cashAccounts[0].number : number
    const firstCashAccountTransfers = await findTransactionsByCashAccountNumber(
        accountNumber
    )
    const reverseFirstCashAccountTransfers = firstCashAccountTransfers.reverse()
    return {
        account: accounts[0],
        cashAccounts: cashAccounts,
        cashAccount: {},
        firstCashAccountTransfers: reverseFirstCashAccountTransfers,
        actualCashAccountNumber: accountNumber,
    }
}

router.get('/', async (req, res) => {
    const principal = req.session.user
    res.render('accountActivity', await fetchParameters(principal))
})

router.get('/:account/detail', async (req, res) => {
    const account = req.params.account
    const principal = req.session.user
    res.render('accountActivity', await fetchParameters(principal, account))
})

router.post(['/', '/detail'], async (req, res) => {
    const postNumber = req.body.number
    const principal = req.session.user
    res.render('accountActivity', await fetchParameters(principal, postNumber))
})

router.get('/credit', async (req, res) => {
    const number = req.query.number
    const principal = req.session.user
    const accounts = await findUsersByUsername(principal.username)
    res.render('creditActivity', {
        account: accounts[0],
        actualCreditCardNumber: number,
    })
})

module.exports = router
