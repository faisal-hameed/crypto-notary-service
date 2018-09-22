const Globals = require('./globals');

/* ===== StarService Class ==========================
|  Class with a constructor for new StarService 		|
|  ================================================*/

class StarService {
  constructor() {
    console.log("StarService DB initialized : " + Globals.NotaryDB);
    this.db = Globals.NotaryDB;
  }

  // Find start by address, may return multiple stars owned by same address
  async findByAddress(address) {
    let blocks = await this.db.findByAddress(address);
    // Decode star story from HEX
    let decodedStars = [];
    blocks.forEach(function (block) {
      if (block.body.star) {
        decodedStars.push(this.decodeStory(block));
      }
    }, this);
    return decodedStars;
  }

  // Find start by block hash
  async findByBlockHash(blockHash) {
    let block = await this.db.findByBlockHash(blockHash);
    if (!block) {
      throw new Error('Star not found with hash.');
    }
    // Decode star story from HEX
    block = this.decodeStory(block);
    return block;
  }

  decodeStory(block) {
    if (block) {
      block.body.star.storyDecoded = new Buffer(block.body.star.story, 'hex').toString();
    }
    return block;
  }
}

module.exports = {
  StarService: StarService
}