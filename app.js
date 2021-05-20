const express = require('express');
const app = express();

const log = require('./config/winston');

const api = require('./api/index')
app.use(api);

const {ip, port} = require('./config/config.json')

app.listen(port, function(){
    log.info(`Listening on port ${ip}:${port} ...`);
})
