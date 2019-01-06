const express = require('express');
const router = express.Router();
var Request = require("request");

/* Request validation message */
router.post('/requestValidation', function (req, res, next) {
  let address = req.body.address;
  if (address) {
    Request.post({
      "headers": { "content-type": "application/json" },
      "url": "http://localhost:8000/validation/requestValidation",
      "body": JSON.stringify(req.body)
    }, (error, response, body) => {
        if(error) {
          next(err);
        }
        res.render("index", {validation: JSON.parse(body)});
    });
  } else {
    next("Address is not provided");
  }
});


router.post('/sign', function (req, res, next) {
  Request.post({
    "headers": { "content-type": "application/json" },
    "url": "http://localhost:8000/validation/sign",
    "body": JSON.stringify(req.body)
  }, (error, response, body) => {
      if(error) {
        next(err);
      }
      res.render("index", JSON.parse(body));
  });
});


router.post('/validate', function (req, res, next) {
  Request.post({
    "headers": { "content-type": "application/json" },
    "url": "http://localhost:8000/validation/validate",
    "body": JSON.stringify(req.body)
  }, (error, response, body) => {
      if(error) {
        next(err);
      }
      res.render("index", {signatureStatus: JSON.parse(body).registerStar == true ? 'valid' : 'Invalid'});
  });
});

module.exports = router;
