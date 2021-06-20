'use strict'

const AWS = require('aws-sdk');
const ses = new AWS.SES({
    region: process.env.region
});

const CAKE_PRODUCER_MAIL = process.env.cakeProducerMail;
const ORDER_SYSTEM_MAIL = process.env.orderSystemMail;

module.exports.handlePlacedOrders = ordersPlaced => {
    let ordersPlacedPromises = [];

    for (const order of ordersPlaced) {
        ordersPlacedPromises.push(notifyCakeProducerByMail(order));
    }

    return Promise.all(ordersPlacedPromises);
}

const notifyCakeProducerByMail = order => {
    return ses.sendEmail({
        Destination: {
            ToAddresses: [CAKE_PRODUCER_MAIL]
        },
        Message: {
            Body: {
                Text: {
                    Data: JSON.stringify(order)
                }
            },
            Subject: {
                Data: 'New Cake Order'
            }
        },
        Source: ORDER_SYSTEM_MAIL
    }).promise().then(data => {
        return data;
    });
}