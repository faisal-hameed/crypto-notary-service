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
      if (block.star) {
        decodedStars.push(this.decodeStory(block));
      }
    }, this);
    return decodedStars;
  }

  // Find start by block hash
  async findByBlockHash(blockHash) {
    let block = await this.db.findByBlockHash(blockHash);
    // Decode star story from HEX
    block = this.decodeStory(block);
    return block;
  }

  decodeStory(block) {
    if (block) {
      block.star.storyDecoded = new Buffer(block.star.story, 'hex').toString();
    }
    return block;
  }
}

module.exports = {
  StarService: StarService
}

// let starService = new StarService();
// starService.findByBlockHash('e3f4cb63ed98ab232fceee02c1db68bb979ee27f832723062cca01e3c13c2b6e')
//   .then((data) => console.log(data)).
//   catch((err) => console.log(err));
