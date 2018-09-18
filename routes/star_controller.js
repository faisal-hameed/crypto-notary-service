const express = require('express');
const {StarService} = require('../service/star_service.js');
const router = express.Router();
const starService = new StarService();

/* Get block of particular address. */
router.get('/address/:address', function (req, res, next) {
  console.log('Handle findByAddress(:address)');
  starService.findByAddress(req.params.address)
    .then(function (data) {      
      res.send(JSON.stringify(data));
    })
    .catch(function (err) {
      console.log('Error findByAddress(:address)' + err);
      res.status(500).send({
        'code': '500',
        'status': 'Internal Server Error',
        'message': `${err}`
      }
      );
    })
});

/* Get block of by block hash. */
router.get('/hash/:blockHash', function (req, res, next) {
  console.log('Handle findByBlockHash(:blockHash)');
  starService.findByBlockHash(req.params.blockHash)
    .then(function (data) {      
      res.send(JSON.stringify(data));
    })
    .catch(function (err) {
      console.log('Error findByBlockHash(:blockHash)' + err);
      res.status(500).send({
        'code': '500',
        'status': 'Internal Server Error',
        'message': `${err}`
      }
      );
    })
});

module.exports = router;
