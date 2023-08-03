const { QueryTypes } = require('sequelize')

module.exports = {
    findCreditAccountsByUsername: (username) => {
        const str =
            "select * from creditaccount  where username='" + username + "'"
        return sequelize.query(str, { type: QueryTypes.SELECT })
    },
    updateCreditAccount: (cashAccountId, round, transaction) => {
        const sql =
            "UPDATE creditAccount SET availablebalance='" +
            round +
            "' WHERE cashaccountid ='" +
            cashAccountId +
            "'"
        return sequelize.query(sql, {
            type: QueryTypes.UPDATE,
            transaction: transaction,
        })
    },
}
