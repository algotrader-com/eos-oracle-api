'use strict';
var auth = require('./auth');
module.exports = function(app) {
  var eosTasks = require('./controller');

  /**
   * @typedef DefaultOKResponse
   * @property {enum} status - Status - eg: ok
   */

  /**
   * @typedef CreateSecurityRequest
   * @property {enum} securityType.required - Security Type - eg: spot_cryptos,forex,equity,index
   * @property {string} symbol.required - Security symbol
   * @property {string} quoteCurrency.required - Quote currency
   * @property {string} exchangeName - Exchange name (required for security_types other than forex)
   */

  /**
   * @typedef CreateSecurityResponse
   * @property {enum} status - Status - eg: ok
   * @property {number} securityId.required - ID of created security
   */

  /**
   * @route POST /createSecurity
   * @param {CreateSecurityRequest.model} security.body.required - Security to be created
   * @group securities - Operations on securities
   * @operationId createSecurity
   * @produces application/json
   * @consumes application/json
   * @returns {CreateSecurityResponse.model} 200
   * @security Basic
   */
  app.post('/createSecurity', auth.basic, eosTasks.createSecurity);

  /**
   * @route DELETE /security
   * @param {string} securityId.query.required - Security ID to remove
   * @group securities - Operations on securities
   * @operationId eraseSecurity
   * @produces application/json
   * @consumes application/json
   * @returns {DefaultOKResponse.model} 200
   * @security Basic
   */
  app.delete('/security', auth.basic, eosTasks.eraseSecurity);

  /**
   * @typedef SetPriceRequest
   * @property {number} securityId.required - Security ID
   * @property {number} price.required - Price
   */
  
  /**
   * @route POST /setPrice
   * @param {SetPriceRequest.model} price.body.required
   * @group prices - Operations on prices
   * @operationId setPrice
   * @produces application/json
   * @consumes application/json
   * @returns {DefaultOKResponse.model} 200
   * @security Basic
   */
  app.post('/setPrice', auth.basic, eosTasks.setPrice);

  /**
   * @typedef Security
   * @property {number} securityId.required
   * @property {string} symbol.required
   * @property {string} exchangeName
   * @property {string} quoteCurrency.required
   * @property {enum} securityType.required - Security Type - eg: spot_cryptos,forex,equity,index
   */

  /**
   * @route GET /securities
   * @param {enum} securityType.query - Security Type - eg: spot_cryptos,forex,equity,index
   * @group securities - Operations on securities
   * @operationId getSecurities
   * @produces application/json
   * @consumes application/json
   * @returns {Array.<Security>} 200
   */
  app.get('/securities', eosTasks.getSecurities);

  /**
   * @typedef Price
   * @property {number} timestamp.required
   * @property {number} securityId.required
   * @property {string} symbol.required
   * @property {string} exchangeName
   * @property {string} quoteCurrency.required
   * @property {enum} securityType.required - Security Type - eg: spot_cryptos,forex,equity,index
   * @property {number} lastTradedPrice.required
   */
  
  /**
   * @route GET /prices
   * @param {string} securityIds.query.required - Security IDs (comma-separated eg: 1,2)
   * @group prices - Operations on prices
   * @operationId getPrices
   * @produces application/json
   * @consumes application/json
   * @returns {Array.<Price>} 200
   */
  app.get('/prices', eosTasks.getPrices);

  /**
   * @route GET /securityTypes
   * @group securities - Operations on securities
   * @operationId getSecurityTypes
   * @produces application/json
   * @consumes application/json
   * @returns 200
   */
  app.get('/securityTypes', eosTasks.getSecurityTypes);
};