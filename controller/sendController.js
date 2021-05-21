const express = require('express');
const router = express.Router();
const amqp = require('amqplib');

const log = require('./config/winston');

const url = `amqp://{{RABBITMQ_IP}}:{{RABBITMQ_PORT}}`;
const queueName = 'MQ_test';


router.post('/massage', function(req,res){
    const type = req.params.type;
    amqp.connect(url, function(error, connect){
        if(error){
            log.error(error);
            return;
        }
        connect.createChannel(function(error1, channel){
            if(error1){
                console.log(error1);
                return;
            }
            channel.assertQueue(queueName, {durable: true});
            log.info("Waiting for message in time");

            channel.consume (type, function(msg){
                log.info("Received :: " + msg.content.toString())
            },{
                noAck: true
            })

        });
    });
});



function encode(doc) {
    return new Buffer(JSON.stringify(doc));
}

module.exports = router;