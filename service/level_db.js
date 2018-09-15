const level = require('level');

/* ===== Persist data with LevelDB ===================================
|  Learn more: level: https://github.com/Level/level     |
|  =============================================================*/

class LevelDB {

    constructor(database) {
        this.db = level(database);
    }

    // Add data in levelDB with key
    add(key, value) {
        return new Promise((resolve, reject) => {
            this.db.put(key, value, function(err) {
                if (err) {
                    console.log('Data ' + key + ' submission failed', err);
                    reject(err);
                } else {
                    resolve(value);
                }
            });
        });
    }

    // Deelete data from levelDB with key
    del(key, value) {
        return new Promise((resolve, reject) => {
            this.db.del(key, value, function(err) {
                if (err) {
                    console.log('Data ' + key + ' deletion failed', err);
                    reject(err);
                } else {
                    resolve(value);
                }
            });
        });
    }

    // Get data from levelDB with key
    get(key) {
        return new Promise((resolve, reject) => {
            this.db.get(key, (err, value) => {
                if (err) {
                    console.log("DB err: ", err);
                    resolve(null);
                } else {
                    resolve(value);
                }
            });
        });
    }

    // Count all keys in levelDB
    countRows() {
        return new Promise((resolve) => {
            let count = -1;
            this.db.createReadStream()
            .on('data', () => count++)
            .on('error', () => reject(NaN))
            .on('close', () => resolve(count));
        });
    }
}

module.exports = LevelDB