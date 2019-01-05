// Setup libraries
const bitcoinMessage = require('bitcoinjs-message');
const util = require('util');
const Globals = require('./globals');
const session = require('memory-cache');


class MessageValidator {

    constructor() {        
    }

    async requestValidation(address, readOnly) {
        console.log("requestValidation(address) : " + address);
        let requestTime = (new Date()).getTime();

        let oldValidation = session.get(address);
        console.log("Old Validation : " + JSON.stringify(oldValidation));
        if (oldValidation) {
            // re-request from same address
            let lastRequestTime = oldValidation.requestTimeStamp;
            let timeElapsed = (requestTime - lastRequestTime) / 1000;
            console.log("Time elapsed : " + timeElapsed);
            oldValidation.validationWindow = Globals.ValidationWindow - timeElapsed;
            // If validation window expired, delete validation
            if(oldValidation.validationWindow < 0) {
                this.removeValidation(oldValidation.address);
                throw new Error("Validation window expired. Please re-start validation process.");
            }
            // Return same validation object
            return oldValidation;
        } else {
            // Trying to re-use this method in validateSignature
            if (readOnly) {
                throw Error('Error, Unable to validate signature. You may need to request validation first.');
            }
            console.log('First time request save at : ' + requestTime);
            // First time request, save address/validation
            let newValidation = new ValidationResponse(address, requestTime, Globals.StarRegistry, Globals.ValidationWindow);
            this.saveValidation(newValidation);            
            return newValidation;

        }       
    }


    async validateSignature(address, messageSignature) {
        // Validate whether address exsists
        let validation = await this.requestValidation(address, true);

        // Validation message is always same [starRegistry], right?
        let isValid = bitcoinMessage.verify(validation.getMessage(), address, messageSignature);
        validation.registerStar = isValid;
        //
        this.saveValidation(validation);
        // Return validation object
        return validation;
    }

    saveValidation(validationObj) {
        session.put(validationObj.address, validationObj);
        console.log('Session size >> ' + session.exportJson());
    }

    removeValidation(address) {
        return session.del(address);
    }

}


class ValidationResponse {
    constructor(address, requestTimeStamp, starRegistry, validationWindow) {
        this.address = address;
        this.requestTimeStamp = requestTimeStamp;
        this.starRegistry = starRegistry;
        this.validationWindow = validationWindow;
        this.registerStar = false;
        this.message = this.getMessage();
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
