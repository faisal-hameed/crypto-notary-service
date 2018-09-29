/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const SHA256 = require('crypto-js/sha256');
const Globals = require('./globals');
const MessageValidator = require('./validation_service.js');

const validator = new MessageValidator();


/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
  constructor(data) {
    this.hash = "",
      this.height = 0,
      this.body = data,
      this.time = 0,
      this.previousBlockHash = ""
  }
}

/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

class Blockchain {
  constructor() {
    console.log("Blockchain DB initialized : " + Globals.NotaryDB);
    this.db = Globals.NotaryDB;
    let height = this.getBlockHeight().then((height) => {
      if (height < 0) {
        console.log('Adding genesis block');
        let genesisBlockData = {
          'address': 'genisi-block-address',
          'star': {
            'story': 'Star Registry story just begins'
          }
        }
        this.addBlock(genesisBlockData, true)
          .catch((err) => {
            console.log(err);
          });
      }
    });
  }

  isASCII(str) {
    return /^[\x00-\x7F]*$/.test(str);
  }

  // Add new block
  async addBlock(blockData, isGenesisBlock) {
    let newBlock = new Block(blockData);
    console.log("adding new block " + JSON.stringify(newBlock));

    // Skip validation for Genesis block
    if (!isGenesisBlock) {
      // Validate wallet address
      let validation = await validator.requestValidation(newBlock.body.address, true);
      // If signature is not Valid
      if (!validation.registerStar) {
        throw new Error('Can\'t register star. Signature is not valid.');
      }
    }

    // Validate star story
    let story = newBlock.body.star.story;
    // It was suggested by previous reviewer
    if (story.split(" ").length > Globals.MaxStoryLength) {
      throw new Error("Maximum start story length exceeded, allowed : " + Globals.MaxStoryLength);
    }

    // Story can have only ascii characters
    if (!this.isASCII(story)) {
      throw new Error("Story should contain only ascii characters");
    }

    // Block height
    let height = await this.getBlockHeight() + 1;
    console.log('using height : ' + height);
    newBlock.height = height;

    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0, -3);
    // previous block hash
    if (height > 0) {
      let prevBlock = await this.getBlock(height - 1, false);
      newBlock.previousBlockHash = prevBlock.hash;
    }


    // Encode star story in hex before saving
    newBlock.body.star.story = Buffer.from(story, 'utf8').toString('hex');

    console.log('Generate hash of block : ' + JSON.stringify(newBlock));
    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();

    // Adding block object to chain
    let result = await this.db.add(newBlock.height, JSON.stringify(newBlock).toString());

    // After successfully adding star, remove user registration
    if (result) {
      let deleted = validator.removeValidation(newBlock.body.address);
      console.log("User address remove : " + deleted);
    }

    return newBlock;
  }

  // Get block height
  async getBlockHeight(blockHeight) {
    // return object as a single string
    let height = await this.db.countRows() - 1;
    return height;
  }

  // get block
  async getBlock(blockHeight, decodeStory) {
    // return object as a single string
    let blockStr = await this.db.get(blockHeight);
    let block = JSON.parse(blockStr);
    if (block == null) {
      throw new Error('Block not found with height : ' + blockHeight);
    }
    if (decodeStory) {
      block = this.decodeStory(block);
    }
    return block;
  }

  decodeStory(block) {
    if (block) {
      block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString();
    }
    return block;
  }

  // validate block
  async validateBlock(blockHeight) {
    // get block object
    let block = await this.getBlock(blockHeight, false);
    // get block hash
    let blockHash = block.hash;
    // remove block hash to test block integrity
    block.hash = '';
    // generate block hash
    console.log('Validating block : ' + JSON.stringify(block));
    let validBlockHash = SHA256(JSON.stringify(block)).toString();
    // Compare
    if (blockHash === validBlockHash) {
      return true;
    } else {
      console.log('Block #' + blockHeight + ' invalid hash:\n' + blockHash + '<>' + validBlockHash);
      return false;
    }
  }

  // Validate blockchain
  async validateChain() {
    let errorLog = [];
    let height = await this.getBlockHeight();
    console.log('Chain height : ' + height);
    for (var i = 0; i < height; i++) {
      // validate block
      let isBlockValid = await this.validateBlock(i);
      if (!isBlockValid)
        errorLog.push(i);
      // compare blocks hash link with next block
      let block = await this.getBlock(i, false);
      let nextBlock = await this.getBlock(i + 1, false);
      console.log(block.hash)
      console.log(nextBlock.previousBlockHash)
      if (block.hash !== nextBlock.previousBlockHash) {
        errorLog.push(i);
      }
    }
    if (errorLog.length > 0) {
      console.log('Block errors = ' + errorLog.length);
      console.log('Blocks: ' + errorLog);
      return false;
    } else {
      console.log('No errors detected');
      return true;
    }
  }
}

module.exports = {
  Blockchain: Blockchain,
  Block: Block
}