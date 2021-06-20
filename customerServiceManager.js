'use strict'

const AWS = require('aws-sdk');
const sqs = new AWS.SQS({
    region: process.env.region
});

const CUSTOMER_SERVICE_QUEUE = process.env.customerServiceQueue;

module.exports.notifyCustomerReview = (orderId, orderReview) => {
    return sqs.sendMessage({
        MessageBody: JSON.stringify({
            orderId: orderId,
            orderReview: orderReview,
            reviewData: Date.now()
        }),
        QueueUrl: CUSTOMER_SERVICE_QUEUE
    }).promise();
}