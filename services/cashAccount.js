const { QueryTypes } = require('sequelize')

module.exports = {
    findCashAccountsByUsername: (username) => {
        const str =
            "select * from cashaccount  where username='" + username + "'"
        return sequelize.query(str, { type: QueryTypes.SELECT })
    },
    getFromAccountActualAmount: async (account, transaction) => {
        const sql = 'SELECT availablebalance FROM cashaccount WHERE number = ?'
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            transaction: transaction,
            replacements: [account],
        })
        return result[0].availablebalance
    },
    getIdFromNumber: async (account, transaction) => {
        const sql = 'SELECT id FROM cashaccount WHERE number = ?'
        const result = await sequelize.query(sql, {
            type: QueryTypes.SELECT,
            transaction: transaction,
            replacements: [account],
        })
        return result[0].id
    },
}
