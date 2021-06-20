'use strict';

const orderManager = require('./orderManager');
const kinesisHelper = require('./kinesisHelper');
const cakeProducerManager = require('./cakeProducerManager');
const deliveryManager = require('./deliveryManager');

const createResponse = (status, message) => {
  return {
    statusCode: status,
    body: JSON.stringify(message)
  };
}

module.exports.createOrder = async (event) => {

  const body = JSON.parse(event.body);
  const order = orderManager.createOrder(body);

  return orderManager.placeNewOrder(order).then(() => {
    return createResponse(200, order);
  }).catch(err => {
    return createResponse(400, err);
  });
}

module.exports.fulfillOrder = async (event) => {
  const body = JSON.parse(event.body);
  const orderId = body.orderId;
  const fulfillmentId = body.fulfillmentId;

  return orderManager.fulfillOrder(orderId, fulfillmentId).then(() => {
    return createResponse(200, `Order #${orderId} has been fulfilled succesfully.`);
  }).catch(err => {
    return createResponse(400, err);
  });
}

module.exports.sendOrderNotifications = async (event) => {
  const records = kinesisHelper.getRecords(event);

  const cakeProducerNotifications = sendCakeProducerNotifications(records);
  const deliveryNotifications = sendDeliveryNotifications(records);

  if (!cakeProducerNotifications && !deliveryNotifications) { return 'Nothing to process'; }
  return Promise.all([cakeProducerNotifications, deliveryNotifications]).then(() => {
    return 'success';
  }).catch(err => {
    return err;
  });
}

const sendCakeProducerNotifications = records => {
  const ordersPlaced = records.filter(record => record.eventType === 'order_placed');

  if (!ordersPlaced.length) { return null; }
  return cakeProducerManager.handlePlacedOrders(ordersPlaced);
}

const sendDeliveryNotifications = records => {
  const ordersFulfilled = records.filter(record => record.eventType === 'order_fulfilled');

  if (!ordersFulfilled.length) { return null; }
  return deliveryManager.handleOrderDelivery(ordersFulfilled);
}

module.exports.deliveryCompanyNotifications = async (event) => {
  console.log(`deliveryCompanyNotifications was called with ${event}`);
  return true;
}

module.exports.completeOrder = async (event) => {
  const body = JSON.parse(event.body);
  const orderId = body.orderId;
  const deliveryCompanyId = body.deliveryCompanyId;
  const orderReview = body.orderReview;

  return deliveryManager.completeOrder(orderId, deliveryCompanyId, orderReview).then(() => {
    return createResponse(200, `Order #${orderId} has been completed succesfully.`);
  }).catch(err => {
    return createResponse(400, err);
  });
}

module.exports.customerReviewNotifications = async (event) => {
  console.log(`customerReviewNotifications was called with ${event}`);
  return true;
}