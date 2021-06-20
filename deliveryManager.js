'use strict'

const AWS = require('aws-sdk');
const sqs = new AWS.SQS({
    region: process.env.region
});
const orderManager = require('./orderManager');
const customerServiceManager = require('./customerServiceManager');

const DELIVERY_SERVICE_QUEUE = process.env.deliveryServiceQueue;

module.exports.handleOrderDelivery = ordersFulfilled => {
    let ordersFulfilledPromises = [];

    for (const order of ordersFulfilled) {
        ordersFulfilledPromises.push(
            orderManager.updateOrderForDelivery(order.orderId).then(updatedOrder => {
                return notifyDeliveryCompany(updatedOrder);
            })
        );
    }

    return Promise.all(ordersFulfilledPromises);
}

const notifyDeliveryCompany = updatedOrder => {
    return sqs.sendMessage({
        MessageBody: JSON.stringify(updatedOrder),
        QueueUrl: DELIVERY_SERVICE_QUEUE
    }).promise();
}

module.exports.completeOrder = (orderId, deliveryCompanyId, orderReview) => {
    return orderManager.updateOrderDeliveryData(orderId, deliveryCompanyId).then(() => {
        return customerServiceManager.notifyCustomerReview(orderId, orderReview);
    });
}