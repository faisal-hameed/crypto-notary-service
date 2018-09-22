const express = require('express');
const { Blockchain } = require('../service/blockchain_service.js');
const router = express.Router();
const blockchain = new Blockchain();

/* Get block at height. */
router.get('/:blockHeight(\\d+)', function (req, res, next) {
  blockchain.getBlock(req.params.blockHeight, true)
    .then(function (data) {
      console.log('Handle getBlock(:blockHeight)');
      res.send(JSON.stringify(data));
    })
    .catch(function (err) {
      console.log('Error getBlock(:blockHeight)' + err);
      res.status(500).send({
        'code': '500',
        'status': 'Internal Server Error',
        'message': `${err}`
      }
      );
    })
});

router.get('/validate', function (req, res, next) {
  blockchain.validateChain()
    .then(function (data) {
      console.log('Validate blockchain : ' + data);
      if (data) {
        res.send("Great!! Blockchain is valid");
      } else {
        res.send("Opps!! Blockchain is Invalid");
      }
    })
});

router.post('/', function (req, res, next) {
  console.log('Handle addBlock');
  console.log('Block body : ' + JSON.stringify(req.body));
  blockchain.addBlock(req.body)
    .then(function (data) {
      console.log('new block added ' + JSON.stringify(data));
      res.send(JSON.stringify(data));
    })
    .catch(function (err) {
      console.log('Error addBlock(data)' + err);
      res.status(500).send({
        'code': '500',
        'status': 'Internal Server Error',
        'message': `${err}`
      }
      );
    });
});



module.exports = router;
