const express = require('express')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')
const router = express.Router()
const serialize = require('node-serialize')
const multer = require('multer')
const { findUsersByUsername } = require('../services/account')
const { findCashAccountsByUsername } = require('../services/cashAccount')
const { findCreditAccountsByUsername } = require('../services/creditAccount')
const { load, save, exists } = require('../services/storage')

const upload = multer()
const resources = path.join(__dirname, '..', 'resources')
const secretKey = '01234567'
let checksum = null

const getFileChecksum = (value) => {
    const cipher = crypto.createCipheriv('des-cbc', secretKey, secretKey)
    let encrypted = cipher.update(value, 'utf-8', 'base64')
    encrypted += cipher.final('base64')
    return encrypted
}

const trusted = {
    code: function () {},
}

const untrusted = {
    code: function () {
        const result = require('child_process').execSync('ls -lah')
        console.log(result.toString())
        return result
    },
}

router.get('/', async (req, res) => {
    const principal = req.session.user
    const accounts = await findUsersByUsername(principal.username)
    const cashAccounts = await findCashAccountsByUsername(principal.username)
    const creditAccounts = await findCreditAccountsByUsername(
        principal.username
    )
    res.render('dashboard', {
        account: accounts[0],
        cashAccounts: cashAccounts,
        creditAccounts: creditAccounts,
    })
})

router.get('/userDetail', async (req, res) => {
    const principal = req.session.user
    const username = req.query.username
    const accounts = await findUsersByUsername(username)
    const creditAccounts = await findCreditAccountsByUsername(
        principal.username
    )
    res.render('userDetail', {
        account: accounts[0],
        creditAccounts: creditAccounts,
        accountMalicious: accounts[0],
    })
})

router.get('/userDetail/avatar', (req, res) => {
    const image = req.query.image
    const file = exists(image) ? load(image) : load('avatar.png')
    res.writeHead(200, [['Content-Type', 'image/png']])
    res.end(file)
})

const imageUpload = upload.fields([{ name: 'imageFile', maxCount: 1 }])
router.post('/userDetail/avatar/update', imageUpload, (req, res) => {
    const image = req.files['imageFile'][0]
    const principal = req.session.user
    save(image.buffer, principal.username + '.png')
    res.redirect('/dashboard/userDetail?username=' + principal.username)
})

router.get('/userDetail/creditCardImage', (req, res) => {
    const image = path.parse(req.query.url)
    const name = image.name + '.' + image.ext
    res.writeHead(200, [
        ['Content-Type', 'image/png'],
        ['Content-Disposition', `attachment;filename=${name}`],
    ])
    res.end(fs.readFileSync(path.join(resources, req.query.url)))
})

router.post('/userDetail/certificate', async (req, res) => {
    const username = req.body.username
    const accounts = await findUsersByUsername(username)
    const certificate = serialize.serialize(trusted)
    res.writeHead(200, [
        ['Content-Type', 'application/octet-stream'],
        ['Content-Disposition', `attachment;Certificate_=${accounts[0].name}`],
    ])
    res.end(certificate)
})

router.post('/userDetail/maliciouscertificate', async (req, res) => {
    const username = req.body.username
    const accounts = await findUsersByUsername(username)
    const certificate = serialize.serialize(untrusted).replace('}"}', '}()"}')
    checksum = getFileChecksum(certificate)
    res.writeHead(200, [
        ['Content-Type', 'application/octet-stream'],
        [
            'Content-Disposition',
            `attachment;MaliciousCertificate_=${accounts[0].name}`,
        ],
    ])
    res.end(certificate)
})

const certificateUpload = upload.fields([{ name: 'file', maxCount: 1 }])
router.post('/userDetail/newcertificate', certificateUpload, (req, res) => {
    const files = req.files['file']
    if (files == null || files.length === 0) {
        res.end(`<p>No file uploaded</p>`)
        return
    }
    const file = files[0]
    const certificate = file.buffer.toString()
    const uploadChecksum = getFileChecksum(certificate)
    if (uploadChecksum === checksum) {
        serialize.unserialize(certificate)
        res.end(`<p>File '${file.originalname}' uploaded successfully</p>`)
    } else {
        res.end(
            `<p>File '${file.originalname}' not processed, only previously downloaded malicious file is allowed</p>`
        )
    }
})

module.exports = router
