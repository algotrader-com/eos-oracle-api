'use strict';

const ACCOUNT_NAME = process.env.EOS_ACCOUNT_NAME;
const ACCOUNT_PRIVATEKEY = process.env.EOS_PRIVATE_KEY;
const RPC_SERVER = process.env.EOS_RPC_SERVER || 'https://api.testnet.eos.io';

const { Api, JsonRpc } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');  // development only
const fetch = require('node-fetch'); //node only

const privateKeys = [ACCOUNT_PRIVATEKEY]; // eosio acct, dev only

const signatureProvider = new JsSignatureProvider(privateKeys);
const rpc = new JsonRpc(RPC_SERVER, { fetch }); //required to read blockchain state
const api = new Api({ rpc, signatureProvider }); //required to submit transactions

const SECURITY_TYPES = {
    'spot_cryptos': { description: "Spot Cryptos", index: 0 },
    'forex': { description: "Forex", index: 1 },
    'equity': { description: "Equity", index: 2 },
    'index': { description: "Index", index: 3 },
}

module.exports = {

    createSecurity: async (req, res) => {

        const symbol = req.body.symbol;
        const exchangeName = req.body.exchangeName;
        const quoteCurrency = req.body.quoteCurrency;
        const securityTypeString = req.body.securityType;

        try {
            if (symbol == undefined || symbol == null || symbol == '')
                throw "Incorrect or missing parameters (symbol)";

            if (quoteCurrency == undefined || quoteCurrency == null || quoteCurrency == '')
                throw "Incorrect or missing parameters (quoteCurrency)";

            if (securityTypeString == undefined || securityTypeString == null)
                throw "Incorrect or missing parameters (securityType)";

            const securityType = SECURITY_TYPES[securityTypeString];
            if (securityType == undefined || securityType == null)
                throw "Incorrect or missing parameters (securityType)";

            const exchangeNameRequired = securityTypeString !== 'forex';
            if (exchangeNameRequired) {
                if (exchangeName == undefined || exchangeName == null || exchangeName == '')
                    throw "Incorrect or missing parameters (exchangeName)";
            }

            let answer = await api.transact({
                actions: [{
                    account: ACCOUNT_NAME,
                    name: 'newsec',
                    authorization: [{
                        actor: ACCOUNT_NAME,
                        permission: 'active',
                    }],
                    data: {
                        payer: ACCOUNT_NAME,
                        receiver: ACCOUNT_NAME,
                        symbol: symbol,
                        exchange_name: exchangeName,
                        quote_currency: quoteCurrency,
                        security_type: securityType.index,
                    },
                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            });

            // Get the last inserted element
            let result = await rpc.get_table_rows({
                json: true,                 // Get the response as json
                code: ACCOUNT_NAME,         // Contract that we target
                scope: ACCOUNT_NAME,        // Account that owns the data
                table: 'securities',       // Table name
                key_type: 'i64',
                limit: 1,                 // Here we limit to 1 to get only row
                reverse: true,             // Optional: Get reversed data
                show_payer: false,          // Optional: Show ram payer
            });

            if (result.rows.length == 0) {
                throw "No securities found.";
            }

            res.json({ "status": "ok", "securityId": parseInt(result.rows[0].key), "transaction": answer });

        } catch (err) {
            console.log(err);
            res.json({ "error": err })
        }
    },

    eraseSecurity: async (req, res) => {

        let securityId = req.query.securityId;

        try {
            if (securityId == undefined || securityId == null || isNaN(securityId) || securityId === '')
                throw "Incorrect or missing parameters (securityId)";

            securityId = parseInt(securityId);

            let answer = await api.transact({
                actions: [{
                    account: ACCOUNT_NAME,
                    name: 'erase',
                    authorization: [{
                        actor: ACCOUNT_NAME,
                        permission: 'active',
                    }],
                    data: {
                        payer: ACCOUNT_NAME,
                        receiver: ACCOUNT_NAME,
                        security_id: securityId
                    },
                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            });

            res.json({ "status": "ok", "transaction": answer });
        } catch (err) {
            console.log(err);
            res.json({ "error": err })
        }
    },

    setPrice: async (req, res) => {

        const securityId = req.body.securityId;
        const price = req.body.price;
        const timeStamp = Date.now();

        try {
            if (securityId == undefined || securityId == null || isNaN(securityId) || securityId === '')
                throw "Incorrect or missing parameters (securityId)";

            if (price == undefined || price == null || isNaN(parseFloat(price)) || price === '')
                throw "Incorrect or missing parameters (price)";

            let answer = await api.transact({
                actions: [{
                    account: ACCOUNT_NAME,
                    name: 'newprice',
                    authorization: [{
                        actor: ACCOUNT_NAME,
                        permission: 'active',
                    }],
                    data: {
                        payer: ACCOUNT_NAME,
                        receiver: ACCOUNT_NAME,
                        security_id: securityId,
                        price: price.toString(),
                        time_stamp: timeStamp
                    },
                }]
            }, {
                blocksBehind: 3,
                expireSeconds: 30,
            });

            res.json({ "status": "ok", "transaction": answer });

        } catch (err) {
            console.log(err);
            res.json({ "error": err })
        }

    },

    getSecurities: async (req, res) => {
        const securityTypeString = req.query.securityType;
        const noSecurityTypeProvided = securityTypeString == undefined || securityTypeString == null || securityTypeString == '';

        var answer = "[";
        var result;

        try {
            if (noSecurityTypeProvided) {
                result = await rpc.get_table_rows({
                    json: true,                 // Get the response as json
                    code: ACCOUNT_NAME,         // Contract that we target
                    scope: ACCOUNT_NAME,        // Account that owns the data
                    table: 'securities',       // Table name
                    limit: 1000,                 // Here we limit to 1 to get only row
                    reverse: false,             // Optional: Get reversed data
                    show_payer: false,          // Optional: Show ram payer
                });

            } else {
                const securityType = SECURITY_TYPES[securityTypeString];
                if (securityType == undefined || securityType == null)
                    throw "Incorrect or missing parameters (securityType)";

                result = await rpc.get_table_rows({
                    json: true,                 // Get the response as json
                    code: ACCOUNT_NAME,         // Contract that we target
                    scope: ACCOUNT_NAME,        // Account that owns the data
                    table: 'securities',       // Table name
                    index_position: 2,
                    lower_bound: securityType.index,
                    upper_bound: securityType.index,  // Table secondary key value
                    key_type: 'i64',
                    limit: 1000,                 // Here we limit to 1 to get only row
                    reverse: false,             // Optional: Get reversed data
                    show_payer: false,          // Optional: Show ram payer
                });
            }

            for (var row in result.rows) {
                let securityInfo = result.rows[row];
                let securityType = findSecurityTypeByIndex(parseInt(securityInfo["security_type"]));

                let security = {
                    "securityId": parseInt(securityInfo["key"]),
                    "symbol": securityInfo["symbol"],
                    "exchangeName": securityInfo["exchange_name"],
                    "securityType": securityType,
                    "quoteCurrency": securityInfo["quote_currency"]
                };

                answer += JSON.stringify(security) + ",";
            }

            answer = answer.slice(0, -1);
            answer += "]";

            res.json(JSON.parse(answer));

        } catch (err) {
            console.log("error:" + err);
            res.json({ "error": err })
        }
    },

    getPrices: async (req, res) => {
        var answer = "[";

        try {
            if (req.query.securityIds == undefined || req.query.securityIds == null || req.query.securityIds.length == 0)
                throw "Incorrect or missing parameters (securityIds)";

            const securityIds = req.query.securityIds.split(',');

            for (var securityId of securityIds) {
                if (isNaN(securityId) || securityId === '')
                    throw "Incorrect or missing parameters (securityId)";

                let result = await getSinglePrice(securityId);
                answer += JSON.stringify(result) + ",";
            }

            answer = answer.slice(0, -1);
            answer += "]";

            res.json(JSON.parse(answer));

        } catch (err) {
            console.log("error:" + err);
            res.json({ "error": err })
        }
    },

    getSecurityTypes: async (req, res) => {
        const types = [];
        for (const key in SECURITY_TYPES) {
            const type = {};
            type[key] = SECURITY_TYPES[key].description;
            types.push(type);
        }

        res.json({ securityTypes: types });
    },
};

async function getSinglePrice(security) {
    var answer;

    try {
        let securityInfo = await rpc.get_table_rows({
            json: true,                 // Get the response as json
            code: ACCOUNT_NAME,         // Contract that we target
            scope: ACCOUNT_NAME,        // Account that owns the data
            table: 'securities',       // Table name
            lower_bound: security,
            key_type: 'i64',
            limit: 1,                 // Here we limit to 1 to get only row
            reverse: false,             // Optional: Get reversed data
            show_payer: false,          // Optional: Show ram payer
        });

        //console.log(priceInfo);

        if (securityInfo["rows"].length == 0)
            throw "Security not found.";

        if (parseFloat(securityInfo.rows[0]["price"]) == 0)
            throw "No price recorded for the given security."

        let securityType = findSecurityTypeByIndex[parseInt(securityInfo.rows[0]["security_type"])];

        answer = {
            "timestamp": securityInfo.rows[0]["time_stamp"],
            "securityId": parseInt(securityInfo.rows[0]["key"]),
            "symbol": securityInfo.rows[0]["symbol"],
            "exchangeName": securityInfo.rows[0]["exchange_name"],
            "securityType": securityType,
            "quoteCurrency": securityInfo.rows[0]["quote_currency"],
            "lastTradedPrice": parseFloat(securityInfo.rows[0]["price"]).toFixed(8),
        };

    } catch (err) {
        answer = { "error": { "description": err, "securityId": security } };
        console.log(answer);
    }

    return answer;
}

function findSecurityTypeByIndex(index) {
    for (const key in SECURITY_TYPES) {
        const securityType = SECURITY_TYPES[key];
        if (securityType.index === index) {
            return key;
        }
    }
    throw "Security Type not found for index " + index;
}