'use strict';
module.exports = {
  userRoles: ['user', 'admin'],
  blockchain: ['Ethereum', 'Avalanche', 'Polygon', 'Arbitrum', 'Binance Smart Chain', 'Optimism'],
  userStatus: ['In Complete', 'Verified', 'Registered'],
  categories:['Art','Gaming','PFPs','Photography','No-category', 'Music', 'Sports'],
  blockchains: [{
    "name": "Ethereum",
    "chainId": 1,
  },
  {
    "name": "Goerli",
    "chainId": 0x5,
  },
  {
    "name": "Avalanche",
    "chainId": 43114,
  },
  {
    "name": "Polygon",
    "chainId": 137,
  },
  {
    "name": "Arbitrum",
    "chainId": 42161,
  },
  {
    "name": "Binance Smart Chain",
    "chainId": 56,
  },
  {
    "name": "Optimism",
    "chainId": 10,
  }],
  notificationTypes: {follow:'follow', comment:'comment'},
  // notificationTypes: ['follow', 'comment'],
};

module.exports.nonce = Math.floor(Math.random(Math.floor(Date.now() / 1000)) * 10000000000);
module.exports.lastName = Math.floor(Math.random(Math.floor(Date.now() / 1000)) * 100000);
