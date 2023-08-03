const { QueryTypes } = require('sequelize')

module.exports = {
    findTransactionsByCashAccountNumber: (number) => {
        const str =
            'SELECT * FROM "transaction" WHERE number = \'' + number + "'"
        return sequelize.query(str, { type: QueryTypes.SELECT })
    },
    insertNewActivity: (
        date,
        description,
        number,
        amount,
        availablebalance,
        transaction
    ) => {
        const sql =
            'INSERT INTO "transaction" ' +
            '(date, description, number, amount, availablebalance) VALUES (?, ?, ?, ?, ?)'
        return sequelize.query(sql, {
            type: QueryTypes.INSERT,
            transaction: transaction,
            replacements: [date, description, number, amount, availablebalance],
        })
    },
}
