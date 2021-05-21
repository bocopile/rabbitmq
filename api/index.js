const express = require('express');
const router = express.Router();

const receive = require('../controller/receiveController');
const send = require('../controller/sendController');

router.use('/receive',receive);
router.use('/send',send);

router.get('/', function(req, res){
    res.send('Main Page');
});


module.exports = router;