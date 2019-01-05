// Setup libraries
const bitcoin = require('bitcoinjs-lib')
const bitcoinMessage = require('bitcoinjs-message')

/* ===== MessageUtils Class ==========================
|  Class to sign message with private key         |
|  ================================================*/

class MessageUtils {
    constructor() {
      console.log("MessageUtils initialized");
    }
  
    // sign message with private key and return message signature
    async signMessage(address, privateKey, message) {
        
      var keyPair = bitcoin.ECPair.fromWIF(privateKey)

      var signature = bitcoinMessage.sign(message, keyPair.privateKey, keyPair.compressed)
      signature = signature.toString('base64');
      console.log("Sig-1 : "+signature)

      console.log(bitcoinMessage.verify(message, address, signature))

      return signature;
    }

    async verifyMessage(address, signature, message) {

      console.log('Varify result : ' + bitcoinMessage.verify(message, address, signature))
    }
}

module.exports = {
  MessageUtils: MessageUtils
}

let obj = new MessageUtils();
