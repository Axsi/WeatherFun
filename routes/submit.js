const env = require('dotenv').config();
const express = require('express');
const router = express.Router();
module.exports = router;

router.get('/submitCity', function (req, res, next){
    res.send(process.env.WEATHER_API);

});