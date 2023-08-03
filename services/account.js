const { QueryTypes } = require('sequelize')

module.exports = {
    findUsersByUsernameAndPassword: (username, password) => {
        const str =
            "select * from account where username='" +
            username +
            "' AND password='" +
            password +
            "'"
        return sequelize.query(str, { type: QueryTypes.SELECT })
    },
    findUsersByUsername: (username) => {
        const str = "select * from account where username='" + username + "'"
        return sequelize.query(str, { type: QueryTypes.SELECT })
    },
    findAllUsers: () => {
        const str = 'select * from account'
        return sequelize.query(str, { type: QueryTypes.SELECT })
    },
}
