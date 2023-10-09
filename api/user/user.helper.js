const fs = require('fs');
const jwt = require('jsonwebtoken');
const User = require('./user.model');
const config = require('../../config/environment');
const { nonce } = require('../../config/environment/const')

exports.addUser = (data) => {
  return new Promise(async resolve => {
    let newUser = new User(data);
    let saved = await newUser.save();
    return resolve(saved);
  });
}


/**
 * Mongo Query
 */
exports.createNewUser = (event) => {
  return new Promise(async (resolve, reject) => {
    try {
      const randomNumber = Math.floor(Math.random(Math.floor(Date.now() / 1000)) * 100000);
      let publicAddress = event;
      let findUser = await User.findOne({ publicAddress });
      if (findUser) {
        let nonce = findUser['nonce'];
        return resolve(nonce)
      } else {

        let user = new User({
          nonce,
          publicAddress,
          username: `user${randomNumber}`
        });
        await user.save();
        return resolve(user["nonce"]);
      }
      const update = await User.updateOne({ publicAddress }, { nonce });
      return resolve(update);
    } catch (error) {
      reject(error);
    }
  });
}



exports.createJWT = async (userfound) => {

  return new Promise(async (resolve, reject) => {
    try {
      let token = jwt.sign({ _id: userfound['_id'], role: userfound['role'] }, config['secrets']['session'], { expiresIn: 60 * 60 * 30, algorithm: 'HS256' });
      resolve({ token });
    } catch (e) { reject(e) }
  });
};

exports.sendEmailMessage = ({ name, email, message }) => {
  return new Promise(async (resolve, reject) => {
    try {
      name = name || ''
      const templatePath = 'mail_templates/change_password.html';
      let templateContent = fs.readFileSync(templatePath, "utf8");
      templateContent = templateContent.replace("##REQ_TIME##", new Date());
      templateContent = templateContent.replace("##USERNAME##", name);
      templateContent = templateContent.replace("#USERMAIL##", email);
      templateContent = templateContent.replace("#USERMESSAGE##", message);
      templateContent = templateContent.replace("##EMAIL_LOGO##", config.mail_logo);
      templateContent = templateContent.replace("##MAIL_FOOTER##", config.mail_footer);
      templateContent = templateContent.replace(new RegExp("##PROJECT_NAME##", 'gi'), config.project_name);

      const data = {
        to: email,
        html: templateContent,
        from: config.mail_from_email,
        subject: config.project_name + ' - Softtik Exchange Demo',
      }

      config.mailTransporter.sendMail(data, (error, info) => {
        if (error) console.log(error);
        else console.log('Email sent:', info.envelope);
        return resolve();
      });
    } catch (e) { reject(e) }
  });
}


exports.sendSms = (details) => {
  config['twillio']['client'].messages.create({
    to: details['phone'],
    body: details['body'],
    from: config['twillio']['from'],
  }).catch(e => console.log(e))
}