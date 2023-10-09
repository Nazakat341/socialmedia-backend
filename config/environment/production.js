'use strict';
// =================== //
// Production Settings //
// =================== //
module.exports = {
  mongo: {
    WALLET_API: "http://54.213.231.116:4001/api/wallet",

    // db_url: 'mongodb+srv://malik:malik1234@cluster0-vm7xe.mongodb.net/nifty',
    db_url: 'mongodb+srv://malik:malik9353@softtik.a64y6.mongodb.net/nifty-prod',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    debug: false,
  },
  client: `http://46.226.110.43:3000`,
  server: `https://server.nifty.lu`,
  standardPhone: '+352671266666'
};