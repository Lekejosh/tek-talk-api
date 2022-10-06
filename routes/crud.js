const { Router } = require("express");
const { body } = require("express-validator");
const { editProfile } = require("../controllers/edit-profile");
const { followUser } = require("../controllers/follow-crud");
const {
  postPost,
  getPostFromUserId,
  getAllPosts,
  getPostFromId,
  getPostsWithOrOutFeed,
} = require("../controllers/post-crud");

const {
  getIndex,
  getMyProfile,
  getUserProfileFromId,
  getUserProfileFromUserName,
} = require("../controllers/profile-crud");

const { isAuthenticated } = require("../middleware/is-auth");

const postValidator = [
  body("body", "Add 'body'.").isLength({ min: 1 }),
  body("category", "Add 'category'.").isLength({ min: 1 }),
  body("postedIn", "Add 'postedIn'.").isLength({ min: 1 }),
];

const router = Router();

router.get("/", isAuthenticated, getIndex);

router.get("/profile", isAuthenticated, getMyProfile);

router.get("/profile/username/:username", getUserProfileFromUserName);

router.get("/profile/id/:id", getUserProfileFromId);

router.post("/profile/edit", isAuthenticated, editProfile);

router.post("/post", isAuthenticated, postValidator, postPost);

router.get("/post/id/:id", getPostFromUserId);

router.get("/post", getAllPosts);

router.get("/post/:postId", getPostFromId);

router.post("/follow", isAuthenticated, followUser);

router.get("/post/feed/:bool", getPostsWithOrOutFeed);

module.exports = router;
