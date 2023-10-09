"use strict";

const User = require("./user.model");
const Query = require("./query.model");
const Helper = require("./user.helper");
const { sendResponse, errReturned } = require("../../config/dto");
const { SUCCESS, BADREQUEST, NOTFOUND } = require("../../config/ResponseCodes");
var mongoose = require("mongoose");
const {
  categories,
  notificationTypes,
} = require("../../config/environment/const");

/**
 * Get Nonce
 */
exports.getNonce = async (req, res) => {
  try {
    let data = req["params"];
    let publicAddress = data["publicAddress"].toLowerCase();

    let required = ["publicAddress"];
    for (let key of required)
      if (
        !data[key] ||
        data[key] == "" ||
        data[key] == undefined ||
        data[key] == null
      )
        return sendResponse(
          res,
          BADREQUEST,
          "Please Provide Valid Wallet Address",
          []
        );
    if (!validate(publicAddress, "ETH"))
      return sendResponse(
        res,
        BADREQUEST,
        "Please Provide Valid Wallet Address",
        []
      );

    let userCreated = await Helper.createNewUser(publicAddress);
    return sendResponse(res, SUCCESS, "User Nonce", userCreated);
  } catch (error) {
    errReturned(res, error);
  }
};

/**
 * Login With Metamask
 */
exports.loginWithMetamask = async (req, res) => {
  try {
    let { publicAddress, signature, pass } = req["body"];

    if (!signature)
      return sendResponse(res, BADREQUEST, "Please send the signature");
    if (!publicAddress)
      return sendResponse(res, BADREQUEST, "Please send the publicAddress");

    let user = await User.findOne({ publicAddress });
    if (!user) return errReturned(res, "Please provide valid address!");

    const msg = new Buffer(`Nifty,${user["nonce"]}`);
    const msgBuffer = ethUtil.toBuffer(msg);
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const signatureBuffer = ethUtil.toBuffer(signature);
    const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
    const publicKey = ethUtil.ecrecover(
      msgHash,
      signatureParams.v,
      signatureParams.r,
      signatureParams.s
    );
    const addressBuffer = ethUtil.publicToAddress(publicKey);
    const address = ethUtil.bufferToHex(addressBuffer);
    // The signature verification is successful if the address found with
    // ecrecover matches the initial publicAddress
    if (address.toLowerCase() === publicAddress.toLowerCase()) {
      // Update NONCE

      const nonce = Math.floor(Math.random() * 10000000000);
      await User.updateOne({ _id: user["_id"] }, { $set: { nonce } }).exec();
      let { token, refreshToken } = await Helper.createJWT(user);
      console.log(`*********** TOKEN `, token);
      return sendResponse(res, SUCCESS, "Login Successful", {
        token,
        refreshToken,
        _id: user["_id"],
      });
    }
    return sendResponse(res, BADREQUEST, "Signature Verification Failed");
  } catch (error) {
    errReturned(res, error);
  }
};

/**
 * My Profile
 **/
exports.myProfle = async (req, res) => {
  try {
    const { user } = req;
    const userDetails = await User.findById(user["_id"]);
    if (!userDetails) return sendResponse(res, NOTFOUND, "User NOT FOUND");

    return sendResponse(res, SUCCESS, "Your details found", userDetails);
  } catch (e) {
    errReturned(res, e);
  }
};

/**
 *
 * Get User Profile
 */
exports.getUserProfile = async (req, res) => {
  try {
    let { userId } = req["params"];
    const { user } = req;
    if (!userId || userId == null)
      return sendResponse(res, BADREQUEST, "Please enter the id");
    if (typeof userId == "string") userId = mongoose.Types.ObjectId(userId);

    let userDetails = await User.findOne({ _id: userId, role: "user" }).lean();
    if (!userDetails) return sendResponse(res, BADREQUEST, "User Not Found");

    if (userDetails["isFollowed"] || userDetails["followers"]) {
      userDetails["followers"].forEach((element) => {
        if (element.toString() == user["_id"].toString()) {
          userDetails["isFollowed"] = true;
        } else {
          userDetails["isFollowed"] = false;
        }
      });
    }
    let response = await getActiveFriend(userId.toString());
    response == null
      ? (userDetails["isOnline"] = false)
      : (userDetails["isOnline"] = true);
    // Check online status
    return sendResponse(res, SUCCESS, "User Profile Founded", userDetails);
  } catch (error) {
    errReturned(res, error);
  }
};

/**
 * Follow User
 */
exports.followUser = async (req, res) => {
  try {
    let { type, userId } = req["body"];
    let data = req["body"];
    let { user } = req;
    let myProfile = await User.findById(user["_id"]);

    let required = ["userId", "type"];
    for (let key of required)
      if (
        !data[key] ||
        data[key] == "" ||
        data[key] == undefined ||
        data[key] == null
      )
        return sendResponse(res, BADREQUEST, `Please Provide ${key}`);

    if (type != "Follow" && type != "UnFollow")
      return sendResponse(res, BADREQUEST, "Please send the valid type");

    let userDetails = await User.findById(userId);
    if (!userDetails) return sendResponse(res, NOTFOUND, "User Not Found");

    if (type == "Follow") {
      if (
        myProfile["following"].length > 0 &&
        myProfile["following"].includes(userId)
      )
        return sendResponse(
          res,
          BADREQUEST,
          "You are already following this user!!!!"
        );
      if (myProfile["friends"].includes(userId)) {
        // return sendResponse(res, SUCCESS, "Do nothing")
        // other_user *******userId
        // my_user *******myProfile
        let response = await Promise.all([
          User.updateOne(
            { _id: myProfile["_id"] },
            { $push: { following: userId } }
          ),
          User.updateOne(
            { _id: myProfile["_id"] },
            { $inc: { followingCount: 1 } }
          ).exec(),
          User.updateOne(
            { _id: userId },
            { $push: { followers: myProfile["_id"] } }
          ),
          User.updateOne(
            { _id: userId },
            { $inc: { followersCount: 1 } }
          ).exec(),
        ]);

        // Create notification for user
        let notification = new Notification({
          type: notificationTypes.follow,
          message: `${userDetails.name} starts following you`,
          sender: user["_id"],
          receiver: userId,
        });
        await notification.save();

        return sendResponse(res, SUCCESS, "Followed Successfully");
      } else {
        // other_user *******userId
        // my_user *******myProfile
        let response = await Promise.all([
          User.updateOne(
            { _id: myProfile["_id"] },
            { $push: { friends: userId } }
          ),
          User.updateOne(
            { _id: myProfile["_id"] },
            { $push: { following: userId } }
          ),
          User.updateOne(
            { _id: myProfile["_id"] },
            { $inc: { followingCount: 1 } }
          ).exec(),
          User.updateOne(
            { _id: userId },
            { $push: { friends: myProfile["_id"] } }
          ),
          User.updateOne(
            { _id: userId },
            { $push: { followers: myProfile["_id"] } }
          ),
          User.updateOne(
            { _id: userId },
            { $inc: { followersCount: 1 } }
          ).exec(),
        ]);

        return sendResponse(res, SUCCESS, "Followed Successfully");
      }
    } else {
      let isFollowed = true;

      if (
        myProfile["following"].length > 0 &&
        myProfile["following"].includes(userId)
      )
        isFollowed = false;

      if (isFollowed == true)
        return sendResponse(res, BADREQUEST, "You are not following this user");
      let response = await Promise.all([
        // From my profile
        User.updateOne(
          { _id: myProfile["_id"] }, // query matching , refId should be "ObjectId" type
          { $pull: { following: userId } } // arr will be array of objects
        ),
        User.updateOne(
          { _id: myProfile["_id"] },
          { $inc: { followingCount: -1 } }
        ).exec(),
        // From other profile
        User.updateOne(
          { _id: userId }, // query matching , refId should be "ObjectId" type
          { $pull: { followers: myProfile["_id"] } } // arr will be array of objects
        ),
        User.updateOne(
          { _id: userId },
          { $inc: { followersCount: -1 } }
        ).exec(),
      ]);

      const updatedUser = await User.findById(user["_id"]);
      if (
        !updatedUser["followers"].includes(userId) &&
        !updatedUser["following"].includes(userId)
      ) {
        response = await Promise.all([
          User.updateOne(
            { _id: myProfile["_id"] },
            { $pull: { friends: userId } }
          ),
          User.updateOne(
            { _id: userId },
            { $pull: { friends: myProfile["_id"] } }
          ),
        ]);
      }

      return sendResponse(res, SUCCESS, "UNFOLLOWED Successfully");
    }
  } catch (error) {
    errReturned(res, error);
  }
};

/**
 * Edit Profile
 */
exports.editProfile = async (req, res) => {
  try {
    let { user } = req;
    if (!user) return sendResponse(res, NOTFOUND, "User NOTFOUND");
    let updateObj = req["body"];
    let required = ["firstName", "lastName"];
    let data = req["body"];

    for (let key of required)
      if (
        !data[key] ||
        data[key] == "" ||
        data[key] == undefined ||
        data[key] == null
      )
        return sendResponse(res, BADREQUEST, `Please enter ${key}`, []);

    let {
      firstName,
      lastName,
      name,
      username,
      phone,
      gender,
      dob,
      description,
    } = updateObj;
    name = `${firstName} ${lastName}`;
    if (name.length < 8 || name.length > 25)
      return sendResponse(
        res,
        BADREQUEST,
        "name length must be between 8 to 25 character"
      );
    if (dob >= "2010-01-01T21:21")
      return sendResponse(res, BADREQUEST, "You're under 13 years old");
    if (username) {
      if (username.includes(" "))
        return sendResponse(res, BADREQUEST, "Do not add space in username ");
    }

    // if (updateObj["username"] == updatedUser["username"]) return sendResponse(res, BADREQUEST, "This username has already taken ")
    for (let prop in updateObj) if (!updateObj[prop]) delete updateObj[prop];
    await User.updateOne({ _id: user["_id"] }, updateObj, {
      runValidators: true,
    });

    let updatedUser = await User.findById(user["_id"]);

    // if (updatedUser["name"] != `${updatedUser["firstName"]} ${updatedUser["lastName"]}`)
    await User.updateOne(
      { _id: user["_id"] },
      (updatedUser[
        "name"
      ] = `${updatedUser["firstName"]} ${updatedUser["lastName"]}`),
      { runValidators: true }
    );
    if (firstName || lastName) {
      await User.updateOne(
        { _id: user["_id"] },
        { name: `${firstName} ${lastName}` },
        { runValidators: true }
      );
      updatedUser = await User.findById(user["_id"]);
    }

    return sendResponse(res, SUCCESS, "User Updated Successfully", updatedUser);
  } catch (error) {
    errReturned(res, error);
  }
};

/**
 * Edit Profile
 */
exports.editProfilePicture = async (req, res) => {
  try {
    let { files, user } = req;
    let userDetails = await User.findById(user["_id"]).exec();
    if (!user) return sendResponse(res, NOTFOUND, `User not found`);
    if (!files || files == undefined || files.length <= 0)
      return sendResponse(res, BADREQUEST, "Please Add Profile Picture");

    userDetails["profilePicture"] = files[0]["transforms"][0]["location"];

    await userDetails.save();

    return sendResponse(
      res,
      SUCCESS,
      `Profile Picture Updated Successfully !!!`,
      { userDetails }
    );
  } catch (error) {
    errReturned(res, error);
  }
};

/**
 * Edit Cover Photo or video
 */
exports.updateUserBanner = async (req, res) => {
  try {
    // let { id } = req['params'];
    let { user } = req;
    let coverVideo;
    let thumbnail;

    if (!req["files"] || req["files"] == undefined || req["files"].length <= 0)
      return sendResponse(res, BADREQUEST, "Please Upload Cover Image");

    user = await User.findById(user["_id"]);
    for (let value of Object.values(req["files"])) {
      if (value["transforms"]) {
        thumbnail = value["transforms"].filter(
          ({ id }) => id === "thumbnail"
        )[0];
        coverVideo = "";
      } else {
        coverVideo = value["location"];
        thumbnail = "";
      }
    }
    if (coverVideo === "" && !thumbnail)
      return sendResponse(
        res,
        BADREQUEST,
        `Please provide cover Image or Video `
      );

    // let user = await User.findById(id);
    // if (!user) return sendResponse(res, BADREQUEST, `Unable to find user`);

    if (coverVideo === "") {
      user["coverVideo"] = "";
      user["cover"] = thumbnail["location"];
      user["updated_at"] = Date.now();
      await user.save();

      return sendResponse(res, SUCCESS, "Cover Image Changed Successfully", {
        user,
      });
    } else {
      user["coverVideo"] = coverVideo;
      user["cover"] = "";
      user["updated_at"] = Date.now();
      await user.save();
      return sendResponse(res, SUCCESS, "Cover Video Changed Successfully", {
        user,
      });
    }
  } catch (error) {
    errReturned(res, error);
  }
};

exports.topSellers = async (req, res) => {
  try {
    // let {  user } = req['params'];
    // console.log('****user',user)
    let topSellers = await User.find().select({
      username: 1,
      profilePicture: 1,
    });

    if (topSellers.length < 1)
      return sendResponse(res, BADREQUEST, "Top Seller not found");

    return sendResponse(
      res,
      SUCCESS,
      "Top sellers get query successfully ",
      topSellers
    );
  } catch (error) {
    errReturned(res, error);
  }
};

/**
 * Check Username Duplication
 */
exports.checkUsername = async (req, res) => {
  try {
    let { input } = req["params"];
    let userDetails = await User.findOne({ username: input });
    if (userDetails)
      return sendResponse(res, BADREQUEST, "username not available", {
        usernameExists: true,
      });
    return sendResponse(res, SUCCESS, "Available", { usernameExists: false });
  } catch (error) {
    errReturned(res, error);
  }
};

/**
 * Contact US
 */
// exports.contactUs = async (req, res) => {
//   try {
//     let { name, emailAddress, message } = req["body"];
//     let data = req["body"];
//     let { user } = req;
//     let required = ["name", "emailAddress", "message"];
//     for (let key of required)
//       if (
//         !data[key] ||
//         data[key] == "" ||
//         data[key] == undefined ||
//         data[key] == null
//       )
//         return sendResponse(res, BADREQUEST, `Please Provide ${key}`);

//     let newQuery = new Query({
//       name,
//       emailAddress,
//       message,
//       userId: user["_id"],
//     });

//     newQuery.save();

//     return sendResponse(
//       res,
//       SUCCESS,
//       "You Query has been received, We will get back to you soon"
//     );
//   } catch (error) {
//     errReturned(res, error);
//   }
// };

// /**
//  * Search for User & #Hashtags (hashtag suggestions with Name of Hashtag, count of posts & reactions )
//  */

// exports.searchUsersOrTags = async (req, res) => {
//   try {
//     const searchValue = req["params"]["query"];
//     if (!searchValue) {
//       return sendResponse(res, BADREQUEST, "Search query cannot be empty.");
//     }

//     if (searchValue.startsWith("#")) {
//       const searchValueRegex = new RegExp(`${searchValue}`, "i");

//       let tags = await Tag.find({ name: searchValueRegex }).populate(["posts", "followers"]);

//       if (!tags.length) return sendResponse(res, NOTFOUND, "No Tag found");

//       return sendResponse(res, SUCCESS, "Filter Tag result", tags);
//     } else {
//       // search for user
//       const userDetails = await User.find({
//         name: { $regex: searchValue, $options: "i" },
//       });
//       if (userDetails.length < 1) {
//         return sendResponse(res, NOTFOUND, "No users found.");
//       }

//       return sendResponse(res, SUCCESS, "Users found.", userDetails);
//     }
//   } catch (error) {
//     errReturned(res, error);
//   }
// };

/**
 * Testing API
 */
exports.testing = async (req, res) => {
  try {
    return sendResponse(res, SUCCESS, "Successfull");
  } catch (error) {
    errReturned(res, error);
  }
};
