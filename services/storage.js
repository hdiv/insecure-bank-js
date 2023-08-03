const path = require('path')
const fs = require('fs')

const folder = path.join(__dirname, '..', 'resources', 'avatars')

module.exports = {
    exists: (fileName) => {
        const str = path.join(folder, fileName)
        return fs.existsSync(str)
    },
    load: (fileName) => {
        const str = path.join(folder, fileName)
        return fs.readFileSync(str)
    },
    save: (data, fileName) => {
        const str = path.join(folder, fileName)
        fs.writeFileSync(str, data)
    },
}
