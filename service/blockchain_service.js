/* ===== SHA256 with Crypto-js ===============================
|  Learn more: Crypto-js: https://github.com/brix/crypto-js  |
|  =========================================================*/
const SHA256 = require('crypto-js/sha256');
const LevelDB = require('./level_db.js');
const MessageValidator = require('./validation_service.js');

const chainDB = '../db/notary-db';
const MAX_STORY_LENGTH = 250; // maximum story length allowed
// const validator = new MessageValidator();


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
    console.log("Blockchain DB initialized : " + chainDB);
    this.db = new LevelDB(chainDB);
    let height = this.getBlockHeight().then((height) => {
      if (height < 0) {
        console.log('Adding genesis block');
        let genesis = {
          'address': 'genisi-block-address',
          'star': {
            'story': 'Star Registry story just begins'
          }
        }
        this.addBlock(genesis)
          .catch((err) => {
            console.log(err);
          });
      }
    });
  }

  // Add new block
  async addBlock(newBlock) {
    console.log("adding new block");

    // TODO Validate wallet address
    // let validation = validator.requestValidation(newBlock.address, true);

    // Validate star story
    let story = newBlock.star.story;
    if (story.lenght > MAX_STORY_LENGTH) {
      throw new Error("Maximum start story length exceeded, allowed : " + MAX_STORY_LENGTH);
    }

    // Block height
    let height = await this.getBlockHeight() + 1;
    console.log('using height : ' + height);
    newBlock.height = height;

    // UTC timestamp
    newBlock.time = new Date().getTime().toString().slice(0, -3);
    // previous block hash
    if (height > 0) {
      let prevBlock = await this.getBlock(height - 1);
      newBlock.previousBlockHash = prevBlock.hash;
    }


    // Encode star story in hex before saving
    newBlock.star.story = Buffer.from(story, 'utf8').toString('hex');

    // Block hash with SHA256 using newBlock and converting to a string
    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
    // Adding block object to chain
    let result = await this.db.add(newBlock.height, JSON.stringify(newBlock).toString());

    return newBlock;
  }

  // Get block height
  async getBlockHeight(blockHeight) {
    // return object as a single string
    let height = await this.db.countRows();
    return height;
  }

  // get block
  async getBlock(blockHeight) {
    // return object as a single string
    let blockStr = await this.db.get(blockHeight);
    let block = JSON.parse(blockStr);
    if (block == null) {
      throw new Error('Block not found with height : ' + blockHeight);
    }
    return this.decodeStory(block);
  }

  decodeStory(block) {
    if (block) {
      block.star.storyDecoded = new Buffer(block.star.story, 'hex').toString();
    }
    return block;
  }

  // validate block
  async validateBlock(blockHeight) {
    // get block object
    let block = await this.getBlock(blockHeight);
    // get block hash
    let blockHash = block.hash;
    // remove block hash to test block integrity
    block.hash = '';
    // generate block hash
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
    for (var i = 0; i < height - 1; i++) {
      // validate block
      let isBlockValid = await this.validateBlock(i);
      if (!isBlockValid)
        errorLog.push(i);
      // compare blocks hash link
      let block = await this.getBlock(i);
      let previousBlock = await this.getBlock(i + 1);
      console.log(block.hash)
      console.log(previousBlock.previousBlockHash)
      if (block.hash !== previousBlock.previousBlockHash) {
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

//let blockchain = new Blockchain();
//blockchain.validateChain().then((data) => console.log(data));
// blockchain.addBlock(new Block("New block 1"));
