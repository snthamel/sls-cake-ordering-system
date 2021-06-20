'use strict'

const { v1: uuidv1 } = require('uuid');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const kinesis = new AWS.Kinesis();

const TABLE_NAME = process.env.orderTableName;
const STREAM_NAME = process.env.orderStreamName;

module.exports.createOrder = body => {
    return {
        orderId: uuidv1(),
        name: body.name,
        address: body.address,
        productId: body.productId,
        quantity: body.quantity,
        orderDate: Date.now(),
        eventType: 'order_placed'
    };
}

module.exports.placeNewOrder = order => {
    return saveNewOrder(order).then(() => {
        return placeOrderInStream(order);
    });
}

const saveNewOrder = order => {
    return dynamo.put({
        TableName: TABLE_NAME,
        Item: order
    }).promise();
}

const placeOrderInStream = order => {
    return kinesis.putRecord({
        Data: JSON.stringify(order),
        PartitionKey: order.orderId,
        StreamName: STREAM_NAME
    }).promise();
}

module.exports.fulfillOrder = (orderId, fulfillmentId) => {
    const orderUpdateData = getOrderUpdateData(orderId, fulfillmentId);
    return saveUpdatedOrder(orderUpdateData).then(updatedOrder => {
        return placeOrderInStream(updatedOrder);
    });
}

const getOrderUpdateData = (orderId, fulfillmentId) => {
    return {
        key: {
            orderId: orderId
        },
        expression: "set fulfillmentId=:fulfillId, fulfillmentDate=:fulfillDate, eventType=:eventType",
        values: {
            ":fulfillId": fulfillmentId,
            ":fulfillDate": Date.now(),
            ":eventType": "order_fulfilled"
        }
    };
}

const saveUpdatedOrder = orderUpdateData => {
    return dynamo.update({
        TableName: TABLE_NAME,
        Key: orderUpdateData.key,
        UpdateExpression: orderUpdateData.expression,
        ExpressionAttributeValues: orderUpdateData.values,
        ReturnValues: 'ALL_NEW'
    }).promise().then(updatedOrder => {
        return updatedOrder.Attributes;
    });
}

module.exports.updateOrderForDelivery = orderId => {
    const orderUpdateForDeliveryData = getOrderUpdateForDeliveryData(orderId);
    return saveUpdatedOrder(orderUpdateForDeliveryData);
}

const getOrderUpdateForDeliveryData = orderId => {
    return {
        key: {
            orderId: orderId
        },
        expression: "set sentToDeliveryDate=:sentToDeliveryDate",
        values: {
            ":sentToDeliveryDate": Date.now()
        }
    }
}

module.exports.updateOrderDeliveryData = (orderId, deliveryCompanyId) => {
    const orderDeliveryUpdateData = getOrderDeliveryUpdateData(orderId, deliveryCompanyId);
    return saveUpdatedOrder(orderDeliveryUpdateData);
}

const getOrderDeliveryUpdateData = (orderId, deliveryCompanyId) => {
    return {
        key: {
            orderId: orderId
        },
        expression: "set deliveryCompanyId=:deliveryCompanyId, deliveryDate=:deliveryDate",
        values: {
            ":deliveryCompanyId": deliveryCompanyId,
            ":deliveryDate": Date.now()
        }
    };
}