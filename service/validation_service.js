// Setup libraries
const bitcoinMessage = require('bitcoinjs-message')
const util = require('util')
const LevelDB = require('./level_db')

const VALIDATION_WINDOW = 300; //seconds (5 minutes)
const STAR_REGITRY = 'starRegistry';
const USER_DB = './db/user_db';

class MessageValidator {

    constructor() {
        this.userDB = new LevelDB(USER_DB);
        console.log('User DB inititialized : ' + USER_DB);
    }

    async requestValidation(address, readOnly) {
        console.log("requestValidation(address) : " + address);
        let requestTime = (new Date()).getTime();
        let validationWindow = VALIDATION_WINDOW;

        let lastRequestTime = await this.userDB.get(address);
        if (lastRequestTime) {
            // re-request from same address
            let timeElapsed = (requestTime - lastRequestTime) / 1000;
            console.log("Time elapsed : " + timeElapsed);
            validationWindow = validationWindow - timeElapsed;
            requestTime = lastRequestTime;

            // if validation window expired, remove address from DB and restart process
            if (validationWindow < 0) {
                let deleted = await this.userDB.del(address);
                throw Error('Validation window time expired, please restart validation process');
            }
        } else {
            // Trying to re-use this method in validateSignature 
            if (readOnly) {
                throw Error('Error, Unable to validate signature. You may need to request validation first.');
            }
            // First time request, save address/requestTime
            let saved = await this.userDB.add(address, requestTime);
            console.log('First time request save at : ' + requestTime);

        }
        console.log(util.format('Validation window %d: ', validationWindow));
        return new ValidationResponse(address, requestTime, STAR_REGITRY, validationWindow);
    }


    async validateSignature(address, messageSignature) {
        // Validate whether address exsists
        let validation = await this.requestValidation(address, true);

        let isValid = bitcoinMessage.verify(STAR_REGITRY, address, messageSignature);
        validation.registerStar = isValid;
        // Return true/false
        return validation;
    }

}


class ValidationResponse {
    constructor(address, requestTimeStamp, starRegistry, validationWindow) {
        this.address = address;
        this.requestTimeStamp = requestTimeStamp;
        this.starRegistry = starRegistry;
        this.validationWindow = validationWindow;
        this.registerStar = false;
    }

    getMessage() {
        return `${this.address}:${this.requestTimeStamp}:${this.starRegistry}`;
    }
}

module.exports = MessageValidator

// Test script
// let obj = new MessageValidator();
// var address = '1CYgQ8wbdWZPGEWgbxZLq5JUe5e1ECWPe7'
// obj.requestValidation(address).then((res) => {
//     console.log(res.getMessage())

//     var signature = 'ILRRa2Ul2NzgEuVDMSZwTsMBPW1UsCtrZwduCIouK4HVId8g3UyQKkgsPO2MZokqokClTnU8FVbXzMqb6sN89mQ=';
//     obj.validateSignature(address, signature).then((data) => console.log('Signature Valid : ' + data));    

// });
