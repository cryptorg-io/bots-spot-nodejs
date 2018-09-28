'use strict';

const request = require('request-promise');
const crypto = require('crypto');

const apiUrl = 'https://api.cryptorg.net/';

module.exports = class CryptorgApi {

    /**
     * Api constructor
     * @param {string} key
     * @param {string} secret
     */
    constructor(key, secret) {

        this._apiKey = key;
        this._apiSecret = secret;
    }

    /**
     * Check Cryptorg status
     * @returns {Promise<request>}
     */
    status() {

        return this.sendRequest('GET', 'api/status');
    }

    /**
     * Get all user's bots
     * @returns {Promise<request>}
     */
    botList() {

        return this.sendRequest('GET', 'bot/all');
    }

    /**
     * Get bot details
     * @param params[]
     * @returns {Promise<request>}
     */
    botInfo(params) {

        let query = "botId=" + params.botId;
        return this.sendRequest('GET', 'bot/info', query);
    }

    /**
     * Delete bot by id
     * @param params[]
     * @returns {Promise<request>}
     */
    deleteBot(params) {

        let query = "botId=" + params.botId;
        return this.sendRequest('GET', 'bot/delete', query);
    }

    /**
     * Create new bot
     * @param params[]
     * @param attributes[]
     * @returns {Promise<request>}
     */
    createBot(params, attributes) {

        let query = "pair=" + params.pair + "&exchange=" + params.exchange;
        return this.sendRequest('POST', 'bot/create', query, attributes);
    }

    /**
     * Create bot with fixed preset
     * @param params[]
     * @param attributes[]
     * @returns {Promise<request>}
     */
    createPreset(params, attributes) {

        let query = "pair=" + params.pair + "&exchange=" + params.exchange;
        return this.sendRequest('POST', 'bot/create-preset', query, attributes);
    }

    /**
     * Update bot
     * @param params[]
     * @param attributes[]
     * @returns {Promise<request>}
     */
    updateBot(params, attributes) {

        let query = "botId=" + params.botId + "&pair=" + params.pair;
        return this.sendRequest('POST', 'bot/configure', query, attributes);
    }

    /**
     * Activate bot
     * @param params[]
     * @returns {Promise<request>}
     */
    activateBot(params) {

        let query = "botId=" + params.botId;
        return this.sendRequest('GET', 'bot/activate', query);
    }

    /**
     * Deactivate bot
     * @param params[]
     * @returns {Promise<request>}
     */
    deactivateBot(params) {

        let query = "botId=" + params.botId;

        return this.sendRequest('GET', 'bot/deactivate', query);
    }

    /**
     * Start bot force
     * @param params[]
     * @returns {Promise<request>}
     */
    startBotForce(params) {

        let query = "botId=" + params.botId;
        return this.sendRequest('GET', 'bot/start-force', query);
    }

    /**
     * Get bot logs
     * @param params[]
     * @returns {Promise<request>}
     */
    getBotLogs(params) {

        let query = "botId=" + params.botId;
        return this.sendRequest('GET', 'bot/logs', query);
    }

    /**
     * Freeze deal
     * @param params[]
     * @returns {Promise<request>}
     */
    freezeDeal(params) {

        let query = "dealId=" + params.dealId;
        return this.sendRequest('GET', 'deal/freeze', query);
    }

    /**
     * Unfreeze deal
     * @param params[]
     * @returns {Promise<request>}
     */
    unfreezeDeal(params) {

        let query = "dealId=" + params.dealId;
        return this.sendRequest('GET', 'deal/unfreeze', query);
    }

    /**
     * Update TakeProfit
     * @param params[]
     * @returns {Promise<request>}
     */
    updateTakeProfit(params) {

        let query = "dealId=" + params.dealId;
        return this.sendRequest('GET', 'deal/update-take-profit', query);
    }

    /**
     * Cancel deal
     * @param params[]
     * @returns {Promise<request>}
     */
    cancelDeal(params) {

        let query = "dealId=" + params.dealId;
        return this.sendRequest('GET', 'deal/cancel', query);
    }

    /**
     * Get deal details
     * @param params[]
     * @returns {Promise<request>}
     */
    dealInfo(params) {

        let query = "dealId=" + params.dealId;
        return this.sendRequest('GET', 'deal/info', query);
    }

    /**
     * Get analytics
     * @param params[]
     * @param attributes[]
     * @returns {Promise<request>}
     */
    getAnalytics(params, attributes) {

        let query = "start=" + params.start + "&end=" + params.end;
        return this.sendRequest('POST', 'analytics/get', query, attributes);
    }

    /**
     * Generate a signature to sign API requests that require authorisation.
     * @access private
     * @param {string} method Type of request method.
     * @param {string} url Action url
     * @param {(string|string[])} query Query params.
     * @param {(string|string[])} params
     * @return {Promise<request>}.
     */
    sendRequest(method, url, query = null, params = null) {

        let nonce = new Date().getTime();

        let hash = this.getSignature(url, query, nonce);

        let header = {

            "CTG-API-SIGNATURE" : hash,
            "CTG-API-KEY": this._apiKey,
            "CTG-API-NONCE": nonce
        };

        let options = {

            "headers" : header,
            "method": method,
            "uri": apiUrl + url + '?' + query
        };

        return new Promise(function (resolve, reject) {

            if (method === 'GET') {

                request.get(options, function(err, resp, body) {

                    if (err) reject(err);
                    else resolve(body);
                });
            }

            else if (method === 'POST') {

                options['form'] = params;

                request.post(options, function(err, resp, body) {

                    if (err) reject(err);
                    else resolve(body);
                });
            }
        });
    }

    /**
     * Generate a signature to sign API requests that require authorisation.
     * @param {string} path Action path.
     * @param {string} queryString Query params.
     * @param {number} nonce Number of milliseconds since the Unix epoch.
     * @returns {PromiseLike<ArrayBuffer>}
     */
    getSignature(path, queryString, nonce) {

        let strForSign = path + '/' + nonce + '/' + queryString;
        let signatureStr = new Buffer(strForSign).toString('base64');
        
        return crypto.createHmac('sha256', this._apiSecret).update(signatureStr).digest('hex');
    }
};
