'use strict';

const ip = require('ip');
const _ = require('lodash');
const path = require('path');
const aws = require('aws-sdk');
// const sharp = require('sharp');
// const multer = require('multer');
const express = require('express');
// const nodemailer = require('nodemailer');

const AccessToken = require('twilio').jwt.AccessToken;

process.env.IP = ip.address();
const port_no = process.env.PORT || 3000;
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.jwtSecret = '$2a$06$GXmQiERBvYRGD91bIJLWRO2m4WGUpj7IRuSuve3pZ3B5rRtLIzm2G';

if (process['env']['NODE_ENV'] === 'production') {
  var options = {
    token: {
      // key: "/home/admin/server-nifty/config/environment/AuthKey_SJU2U74N63.p8",
      key: path.normalize(__dirname + '/AuthKey_SJU2U74N63.p8'),
      keyId: "SJU2U74N63",
      teamId: "2CT6QS283C"
    },
    production: false
  };
}
else {
  var options = {
    token: {
      // key: "/home/talhamalik/Desktop/Workspace/Backend/server-nifty/config/environment/AuthKey_SJU2U74N63.p8",
      key: path.normalize(__dirname + '/AuthKey_SJU2U74N63.p8'),
      keyId: "SJU2U74N63",
      teamId: "2CT6QS283C"
    },
    production: false
  };
}

// const multerS3 = require('multer-s3-transform');

process['env']['IP'] = ip.address();
process['env']['NODE_ENV'] = process['env']['NODE_ENV'] || 'development';
process['env']['jwtSecret'] = '$2a$06$GXmQiERBvYRGD91bIJLWRO2m4WGUpj7IRuSuve3pZ3B5rRtLIzm2G';

// const s3 = new aws.S3(
//   {
//     region: process['env']['AWS_GOTOGODS_REGIONS'],
//     accessKeyId: process['env']['AWS_ACCESS_KEY'],
//     secretAccessKey: process['env']['AWS_SECRET_KEY'],
//   });

// let ses = new aws.SES(
//   {
//     region: process['env']['AWS_REGIONS'],
//     accessKeyId: process['env']['AWS_KEY'],
//     secretAccessKey: process['env']['AWS_SECRET']
//   });

const all = {

  // s3,
  env: process.env.NODE_ENV,
  // Frontend path to server


  assets: express.static(__dirname + '/../../public'),
  view: path.normalize(__dirname + '/../../public/index.html'),

  // Server port
  port: process.env.PORT || 4004,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data ?
  seedDB: true,

  mongo: {
    db_url: process['env']['dev_db_url'],
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    },
    debug: false,
  },

  secrets: {
    session: 'Nazakat12345',
    refresh: 'Nifty_s3cr3t_1111'
  },
}

//   /* S3 Bucket Configurations */
  // s3Bucket: multer({
  //   limits: {
  //     fileSize: 1024 * 1024 * 200 /* We are allowing only 200 MB files */
  //   },
  //   storage: multerS3({
  //     s3,
  //     bucket: 'nifty-temp-bucket',
  //     key: (req, file, cb) => {
  //       let fileType = file['mimetype'].split('/')[1];
  //       return cb(null, `${process['env']['NODE_ENV']}/${fileType}/${file['originalname'].split('.')[0]}-${new Date().getTime()}.${fileType}`);
  //     },
  //     shouldTransform: function (req, file, cb) {
  //       let fileType = file['mimetype'].split('/')[1];
  //       if (fileType === 'png' || fileType === 'jpeg' || fileType === 'webp' || fileType === 'raw' || fileType === 'tiff'
  //         || fileType === 'dz' || fileType === 'openslide' || fileType === 'ppm' || fileType === 'fits' || fileType === 'gif'
  //         || fileType === 'svg' || fileType === 'v'
  //       ) cb(null, true)
  //       else cb(null, false)
  //     },
  //     transforms: [
  //       {
  //         id: 'thumbnail',
  //         key: function (req, file, cb) {
  //           let fileType = file['mimetype'].split('/')[1];
  //           if (fileType === 'png') fileType = 'jpeg'
  //           cb(null, `${process['env']['NODE_ENV']}/${fileType}/${file['originalname'].split('.')[0]}-${new Date().getTime()}.${fileType}`)
  //         },
  //         transform: function (req, file, cb) {

  //           let fileType = file['mimetype'].split('/')[1];
  //           //CompressingImages according to their respective formats
  //           if (fileType === 'jpeg') cb(null, sharp().jpeg({ quality: 25 }))
  //           if (fileType === 'png') cb(null, sharp().toFormat('jpeg').jpeg({ quality: 25, force: true }))
  //           if (fileType === 'webp') cb(null, sharp().webp({ quality: 25 }))
  //           if (fileType === 'raw') cb(null, sharp().raw({ quality: 25 }))
  //           if (fileType === 'tiff') cb(null, sharp().tiff({ quality: 25 }))
  //           if (fileType === 'dz') cb(null, sharp().dz({ quality: 25 }))
  //           if (fileType === 'input') cb(null, sharp().input({ quality: 25 }))
  //           if (fileType === 'magick') cb(null, sharp().magick({ quality: 25 }))
  //           if (fileType === 'openslide') cb(null, sharp().openslide({ quality: 25 }))
  //           if (fileType === 'ppm') cb(null, sharp().ppm({ quality: 25 }))
  //           if (fileType === 'fits') cb(null, sharp().fits({ quality: 25 }))
  //           if (fileType === 'gif') cb(null, sharp().gif({ quality: 25 }))
  //           if (fileType === 'svg') cb(null, sharp().svg({ quality: 25 }))
  //           if (fileType === 'pdf') cb(null, sharp().pdf({ quality: 25 }))
  //           if (fileType === 'v') cb(null, sharp().v({ quality: 25 }))

  //           if (fileType === 'mp4') {
  //             console.log(file);
  //             // cb(null, Buffer.from(file['originalname']))
  //             try {
  //               var process = new ffmpeg(file['originalname']);
  //               process.then(function (video) {
  //                 console.log('The video is ready to be processed');
  //               }, function (err) {
  //                 console.log('Error: ' + err);
  //               });
  //             } catch (error) {
  //               console.log(`ERROR:${JSON.stringify(error)}`);
  //             }
  //           }
  //         }
  //       }
  //     ]
  //   })
  // }),






//    /* S3 Bucket Configurations */
  //  s3CollectionBucket: multer({
  //   limits: {
  //     fileSize: 1024 * 1024 * 200 /* We are allowing only 200 MB files */
  //   },
  //   storage: multerS3({
  //     s3,
  //     bucket: 'nifty-temp-bucket',
  //     key: (req, file, cb) => {
  //       let fileType = file['mimetype'].split('/')[1];
  //       return cb(null, `${process['env']['NODE_ENV']}/${fileType}/${file['originalname'].split('.')[0]}-${new Date().getTime()}.${fileType}`);
  //     },
  //     shouldTransform: function (req, file, cb) {
  //       let fileType = file['mimetype'].split('/')[1];
  //       if (fileType === 'png' || fileType === 'jpeg' || fileType === 'webp' || fileType === 'raw' || fileType === 'tiff'
  //         || fileType === 'dz' || fileType === 'openslide' || fileType === 'ppm' || fileType === 'fits' || fileType === 'gif'
  //         || fileType === 'svg' || fileType === 'v'
  //       ) cb(null, true)
  //       else cb(null, false)
  //     },
  //     transforms: [
  //       {
  //         id: 'thumbnail',
  //         key: function (req, file, cb) {
  //           let fileType = file['mimetype'].split('/')[1];
  //           if (fileType === 'png') fileType = 'jpeg'
  //           cb(null, `${process['env']['NODE_ENV']}/${fileType}/${file['originalname'].split('.')[0]}-${new Date().getTime()}.${fileType}`)
  //         },
  //         transform: function (req, file, cb) {

  //           let fileType = file['mimetype'].split('/')[1];
  //           //CompressingImages according to their respective formats
  //           if (fileType === 'jpeg') cb(null, sharp().jpeg({ quality: 25 }))
  //           if (fileType === 'png') cb(null, sharp().toFormat('jpeg').jpeg({ quality: 25, force: true }))
  //           if (fileType === 'webp') cb(null, sharp().webp({ quality: 25 }))
  //           if (fileType === 'raw') cb(null, sharp().raw({ quality: 25 }))
  //           if (fileType === 'tiff') cb(null, sharp().tiff({ quality: 25 }))
  //           if (fileType === 'dz') cb(null, sharp().dz({ quality: 25 }))
  //           if (fileType === 'input') cb(null, sharp().input({ quality: 25 }))
  //           if (fileType === 'magick') cb(null, sharp().magick({ quality: 25 }))
  //           if (fileType === 'openslide') cb(null, sharp().openslide({ quality: 25 }))
  //           if (fileType === 'ppm') cb(null, sharp().ppm({ quality: 25 }))
  //           if (fileType === 'fits') cb(null, sharp().fits({ quality: 25 }))
  //           if (fileType === 'gif') cb(null, sharp().gif({ quality: 25 }))
  //           if (fileType === 'svg') cb(null, sharp().svg({ quality: 25 }))
  //           if (fileType === 'pdf') cb(null, sharp().pdf({ quality: 25 }))
  //           if (fileType === 'v') cb(null, sharp().v({ quality: 25 }))

  //           // if (fileType === 'mp4') {
  //           //   console.log(file);
  //           //   // cb(null, Buffer.from(file['originalname']))
  //           //   try {
  //           //     var process = new ffmpeg(file['originalname']);
  //           //     process.then(function (video) {
  //           //       console.log('The video is ready to be processed');
  //           //     }, function (err) {
  //           //       console.log('Error: ' + err);
  //           //     });
  //           //   } catch (error) {
  //           //     console.log(`ERROR:${JSON.stringify(error)}`);
  //           //   }
  //           // }
  //         }
  //       }
  //     ]
  //   })
  // }),



//   // Email Configurations
//   mailTransporter: nodemailer.createTransport({
//     // SES: ses({ apiVersion: '2010-12-01' })
//     SES: ses
//   }),

//   // Twillio Configurations
//   twillio: {
//     from: '+17625857591',
//     client: require('twilio')(`AC86ef1d3d136dfe8a70bbecfc88816e1c`, `52dfe954d0d5b792cf81ce1e13f3a518`)
//   },

//   thisdomain: `http://${ip.address()}:${port_no}`,

//   project_name: 'Nifty Backend',
//   support_title: 'Nifty Support',
//   support_email: 'info@nifty.com',
//   mail_footer: 'The Softtik Team',
//   mail_from_email: 'info@Nifty.com',
//   mail_from_name: 'Nifty',
//   mail_logo: 'https://www.nifty.com/logo.png',

//   pepper: '78uA_PPqX&@$',
//   encPass: 's1XrWeMEc2aJn1tu5HMp',
//   rpc_secret: "4b8cf527e04e4a8abe40d9b2030129fckf546pwsdafe",
// };

/* Export the config object based on the NODE_ENV*/
/*===============================================*/

module.exports = _.merge(all, require(`./${process.env.NODE_ENV}.js`) || {}, require(`./const.js`));