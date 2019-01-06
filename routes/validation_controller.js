const express = require('express');
const MessageValidator = require('../service/validation_service.js');
const {MessageUtils} = require('../service/message-utils.js');
const router = express.Router();
const validator = new MessageValidator();
const messageUtils = new MessageUtils();

/* Request validation message */
router.post('/requestValidation', function (req, res, next) {
  let address = req.body.address;
  if (address) {
    validator.requestValidation(address, false)
      .then(function (obj) {
        console.log('Handle requestValidation(address)' + JSON.stringify(obj));
        res.send({
          'address': obj.address,
          'requestTimeStamp': obj.requestTimeStamp,
          'message': obj.getMessage(),
          'validationWindow': obj.validationWindow
        });
      })
      .catch(function(err) {next(err)});
  } else {
    next("Address is not provided");
  }
});


router.post('/sign', function (req, res, next) {
  console.log('Handle sign message : ' + JSON.stringify(req.body));
  messageUtils.signMessage(req.body.address, req.body.privateKey, req.body.message)
    .then(function (obj) {
      console.log('Handle Signature :  ' + obj);
      res.send({
        "signature": obj
      });
    })
    .catch(function(err) {next(err)});
});


router.post('/validate', function (req, res, next) {
  console.log('Handle Validate : ' + JSON.stringify(req.body));
  validator.validateSignature(req.body.address, req.body.signature)
    .then(function (obj) {
      console.log('Validation response ' + JSON.stringify(obj));
      res.send({
        "registerStar": obj.registerStar,
        "status": {
          'address': obj.address,
          'requestTimeStamp': obj.requestTimeStamp,
          'message': obj.getMessage(),
          'validationWindow': obj.validationWindow,
          'messageSignature': obj.registerStar == true ? 'valid' : 'Invalid'
        }
      });
    })
    .catch(function(err) {next(err)});
});



module.exports = router;
