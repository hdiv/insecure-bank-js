const { QueryTypes } = require('sequelize')
const { getFromAccountActualAmount } = require('./cashAccount')
const { getIdFromNumber } = require('./cashAccount')
const { updateCreditAccount } = require('./creditAccount')
const { insertNewActivity } = require('./activity')

const insertTransfer = (transfer, transaction) => {
    const sql =
        'INSERT INTO transfer (fromAccount, toAccount, description, amount, fee, username, date) VALUES (?, ?, ?, ?, ?, ?, ?)'
    return sequelize.query(sql, {
        type: QueryTypes.INSERT,
        transaction: transaction,
        replacements: [
            transfer.fromAccount,
            transfer.toAccount,
            transfer.description,
            transfer.amount,
            transfer.fee,
            transfer.username,
            transfer.date,
        ],
    })
}

module.exports = {
    createNewTransfer: async (transfer) => {
        const t = await sequelize.transaction()
        try {
            await insertTransfer(transfer, t)

            const transferAmount = parseFloat(transfer.amount)
            const transferFee = parseFloat(transfer.fee)

            const actualAmount = await getFromAccountActualAmount(
                transfer.fromAccount,
                t
            )
            const amountTotal = actualAmount - (transferAmount + transferFee)
            const amount = actualAmount - transferAmount
            const amountWithFees = amount - transferFee
            const cashAccountId = await getIdFromNumber(transfer.fromAccount, t)
            await updateCreditAccount(cashAccountId, amountTotal.toFixed(2))
            const desc =
                transfer.description.length > 12
                    ? transfer.description.substring(0, 12)
                    : transfer.description
            await insertNewActivity(
                transfer.date,
                'TRANSFER: ' + desc,
                transfer.fromAccount,
                -transferAmount.toFixed(2),
                amount.toFixed(2),
                t
            )
            await insertNewActivity(
                transfer.date,
                'TRANSFER FEE',
                transfer.fromAccount,
                -transferFee.toFixed(2),
                amountWithFees.toFixed(2),
                t
            )

            const toCashAccountId = await getIdFromNumber(transfer.toAccount, t)
            const toActualAmount = await getFromAccountActualAmount(
                transfer.toAccount,
                t
            )
            const toAmountTotal = toActualAmount + transferAmount
            await updateCreditAccount(
                toCashAccountId,
                toAmountTotal.toFixed(2),
                t
            )
            await insertNewActivity(
                transfer.date,
                'TRANSFER: ' + desc,
                transfer.toAccount,
                transferAmount.toFixed(2),
                toAmountTotal.toFixed(2),
                t
            )

            t.commit()
        } catch (e) {
            t.rollback()
        }
    },
}
