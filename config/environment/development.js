'use strict';
// ==================== //
// Development Settings //
// ==================== //
module.exports = {
  mongo: {
    db_url: process['env']['dev_db_url'],
    
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    debug: false,
  },
  client: `http://localhost:3000`,
  server: `http://46.226.110.43:4004`,
  standardPhone: '+923170000067'
};
