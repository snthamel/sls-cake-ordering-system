# sls-cake-ordering-system

Serverless backend application for cake order system using AWS services Lambda, API Gateway, DynamoDB, Kinesis, SES and SQS.

This project was built as a learning exercise for LinkedIn Learning course [AWS for Developers: Data-Driven Serverless Applications with Kinesis](https://www.linkedin.com/learning/aws-for-developers-data-driven-serverless-applications-with-kinesis) by [Marcia Villalba](https://www.linkedin.com/in/marciavillalba).

## Getting Started
### Prerequisites
- NPM
- AWS account with programmatic access
- Serverless CLI

> NOTE: When configuring the AWS programmatic access, make sure to use `--profile=[profile_name]` option to save configuration as a new profile so that it will not override any default profile credentials.

### Installation
1. Clone the repo
   ```sh
   git clone https://github.com/snthamel/sls-cake-ordering-system.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

## Configure Emails and SES
For testing, you can create disposable email addresses for both 'application' and 'cake producer'. Make sure to change the `slscakeproducer@grr.la` and `slscakeordersystem@grr.la` in [serverless.yml](serverless.yml) with the emails you have created.

While using the SES sandbox, we have to verify both email addresses used by the application in order to prevent it from spamming.

## Usage
Once the serverless cli is configured with aws credentials, execute
```sh
AWS_PROFILE=[profile_name] serverless deploy
```
or 
```sh
AWS_PROFILE=[profile_name] sls deploy
```
to deploy the serverless application to AWS platform.

The deployment will create 3 APIs which can be used to create order, update order as fulfilled and complete order once delivered

### Create order
```
POST /order
```
Sample request body
```json
{
    "name": "John Appleseed",
    "address": "California, CA",
    "productId": "PRD-10101",
    "quantity": 1
}
```

### Update order as fulfilled
```
POST /order/fulfilled
```
Sample request body
```json
{
    "orderId": "29a21200-d1c2-11eb-a8f0-99b0604ad05f",
    "fulfillmentId": "FL99999"
}
```

### Update order as delivered
```
POST /order/delivered
```
Sample request body
```json
{
    "orderId": "29a21200-d1c2-11eb-a8f0-99b0604ad05f",
    "deliveryCompanyId": "DHL-38293829",
    "orderReview": 5
}
```

## Cleanup
If the application needs to be removed from the AWS cloud, execute
```sh
$ AWS_PROFILE=[profile_name] serverless remove
```
or 
```sh
$ AWS_PROFILE=[profile_name] sls remove
```
to delete all the AWS resources.

> NOTE: You will need to remove any verified email addresses through the SES dashboard manually

## License
Distributed under the GNU General Public License License. See `LICENSE` for more information. 

## Contact
Shehan Thamel - [@shehanthamel](https://twitter.com/shehanthamel) - snthamel.lanka@gmail.com