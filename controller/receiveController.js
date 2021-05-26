const express = require('express');
const router = express.Router();
const amqp = require('amqplib');

const log = require('../config/winston');

const url = `amqp://{{RABBITMQ_ID}}:{{RABBITMQ_PW}}@{{{RABBITMQ_URL}}:{{PORT}}`;
const queueName = 'MQ_test';


router.post('/massage', function(req,res){
    const type = req.params.type;
    const massage = req.params.massage;
    amqp.connect(url, function(error, connect){
        if(error){
            log.error(error);
            return;
        }
        connect.createChannel(function(error2, channel){
            if(error2){
                log.error(error2);
                return;
            }
            channel.assertQueue(queueName, {durable: true}, function(error){
                let sendData = {
                    type : type,
                    message : massage
                };
                channel.sendToQueue(queueName, encode(sendData), {
                    persistent: true
                });
                setImmediate(function() {
                    channel.close();
                    connect.close();
                });
            });
        });
    });
});



function encode(doc) {
    return new Buffer(JSON.stringify(doc));
}

module.exports = router;