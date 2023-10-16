"use strict";

const router = require("express").Router();
const auth = require("../../auth/auth.service");
const controller = require("./user.controller");
const { s3Bucket } = require("../../config/environment");

router.get("/getNonce/:publicAddress", controller.getNonce);
router.post("/loginWithMetamask", controller.loginWithMetamask);

router.post("/signup", controller.signup);
router.get("/login", controller.login);

router.get("/me", auth.isAuthenticated(), controller.myProfle);

router.get(
  "/getUserProfile/:userId",
  auth.isAuthenticated(),
  controller.getUserProfile
); // Remove error

router.post("/follow", auth.isAuthenticated(), controller.followUser);

// Edit Profile
router.put("/editProfile", auth.isAuthenticated(), controller.editProfile); // editProfile By User
// Edit Profile Image
// router.put(
//   "/editProfilePicture",
//   auth.isAuthenticated(),
//   s3Bucket.array("profilePicture"),
//   controller.editProfilePicture
// ); // editProfilePicture By User
// router.put(
//   "/updateUserCover",
//   auth.isAuthenticated(),
//   s3Bucket.array("cover"),
//   controller.updateUserBanner
// ); //coverimg & video By User

// router.get('/searchUsers/:input',  controller.searchUsers);
router.get("/checkUsername/:input", controller.checkUsername);

// router.get('/nftPortfolio', auth.isAuthenticated(), controller.nftPortfolio);

router.get("/topSellers", controller.topSellers);

// router.post("/contactUs", auth.isAuthenticated(), controller.contactUs);

router.get("/testing", auth.isAuthenticated(), controller.testing);

// Search Users or Tags
// router.get("/search/:query", controller.searchUsersOrTags);

module.exports = router;
