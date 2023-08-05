const express = require('express')
const router = express.Router()
const { findUsersByUsername } = require('../services/account')
const { findCashAccountsByUsername } = require('../services/cashAccount')
const { createNewTransfer } = require('../services/transfer')
const childProcess = require('child_process')

const toTraces = (string) => {
    return childProcess.execSync(string).toString()
}

const bindTransfer = (req) => {
    return {
        fee: req.body.fee == null ? 20.0 : req.body.fee,
        fromAccount: req.body.fromAccount,
        toAccount: req.body.toAccount,
        description: req.body.description,
        amount: req.body.amount,
    }
}

const transferCheck = async (req, res, transfer) => {
    const principal = req.session.user
    const accounts = await findUsersByUsername(principal.username)
    req.session.pendingTransfer = transfer
    res.render('transferCheck', {
        account: accounts[0],
        transferbean: transfer,
        operationConfirm: {},
    })
}

const transferConfirmation = async (req, res, transfer, accountType) => {
    const principal = req.session.user
    const cashAccounts = await findCashAccountsByUsername(principal.username)
    const accounts = await findUsersByUsername(principal.username)
    const aux = parseFloat(transfer.amount)
    if (aux === 0.0) {
        res.render('newTransfer', {
            account: accounts[0],
            cashAccounts: cashAccounts,
            transfer: transfer,
            error: true,
        })
    } else {
        transfer.username = principal.name
        transfer.date = new Date()
        const amount = parseFloat(transfer.amount)
        const fee = parseFloat(transfer.fee)
        transfer.amount = amount.toFixed(2)
        const feeAmount = (amount * fee) / 100.0
        transfer.fee = feeAmount.toFixed(2)
        await createNewTransfer(transfer)
        res.render('transferConfirmation', {
            transferbean: transfer,
            account: accounts[0],
            accountType: accountType,
        })
    }
}

router.get('/', async (req, res) => {
    const principal = req.session.user
    const accounts = await findUsersByUsername(principal.username)
    const cashAccounts = await findCashAccountsByUsername(principal.username)
    res.cookie('accountType', 'Personal')
    res.render('newTransfer', {
        account: accounts[0],
        cashAccounts: cashAccounts,
        transfer: {
            fee: 5.0,
        },
    })
})

router.post('/', async (req, res) => {
    const accountType = req.cookies['accountType']
    const transfer = bindTransfer(req)
    toTraces(
        `echo ${transfer.fromAccount} to account ${transfer.toAccount} accountType:${accountType}>traces.txt`
    )
    if (accountType === 'Personal') {
        await transferCheck(req, res, transfer)
    } else {
        await transferConfirmation(req, res, transfer, accountType)
    }
})

router.post('/confirm', async (req, res) => {
    const accountType = req.cookies['accountType']
    const transfer = req.session.pendingTransfer
    const action = req.body.action
    if (action === 'confirm' && transfer) {
        delete req.session.pendingTransfer
        await transferConfirmation(req, res, transfer, accountType)
    } else {
        res.redirect('/transfer/redirect/' + accountType)
    }
})

router.get('/redirect/:accountType', (req, res) => {
    res.redirect('transfer')
})

module.exports = router
