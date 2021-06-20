'use strict'

module.exports.getRecords = event => {
    return event.Records.map(record => {
        return JSON.parse(
            Buffer.from(record.kinesis.data, 'base64').toString('utf8')
        );
    });
}