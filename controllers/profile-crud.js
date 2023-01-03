const { catchError } = require("../utils/help-functions");
const User = require("../models/user");
const { isValidObjectId } = require("mongoose");

const fs = require("fs");

const Post = require("../models/post");
const { Notification } = require("../models/notification");

const extractProfile = (user, req) => {
  const {
    name,
    username,
    stack,
    location,
    email,
    bio,
    verified,
    displayUrl,
    displayLocal,
    backdropLocal,
    backdropUrl,
  } = user;

  let profileToReturn = {
    userId: user.id,
    name,
    username,
    stack,
    location,
    email,
    bio,
    verified,
    followingCount: user.following.length,
    followersCount: user.followers.length,
    isFollowing: user.followers.includes(req.userId),
    isFollowedBy: user.following.includes(req.userId),
  };
  if (displayLocal || displayUrl) {
    const fileExists = fs.existsSync(displayLocal);
    profileToReturn.displayUrl = fileExists
      ? "https://" + req.headers.host + "/" + displayLocal
      : displayUrl;
  } else {
    profileToReturn.displayUrl = null;
  }
  if (backdropLocal || backdropUrl) {
    const fileExists = fs.existsSync(backdropLocal);
    profileToReturn.backdropUrl = fileExists
      ? "https://" + req.headers.host + "/" + backdropLocal
      : backdropUrl;
  } else {
    profileToReturn.backdropUrl = null;
  }

  return profileToReturn;
};

const extractSuggestionsInfo = (users, userId) => {
  infosToReturn = [];
  users.forEach((user) => {
    let infoToReturn = {
      userId: user.id,
      username: user.username,
      name: user.name,
      displayUrl: user.displayUrl,
      verified: user.verified,
      isFollowedBy: user.following.includes(userId),
      isFollowing: user.followers.includes(userId),
    };
    infosToReturn.push(infoToReturn);
  });
  return infosToReturn;
};

exports.getIndex = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    res.status(201).json({ message: `You're in! Logged in as ${user.name}` });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const profileToReturn = extractProfile(user, req);

    const myNotifications = await Notification.find({ userId: req.userId });
    const unRead = myNotifications.some((notification) => !notification.seen);
    profileToReturn.unreadNotifications = unRead;
    res.status(200).json(profileToReturn);
  } catch (err) {
    catchError(err, res);
  }
};

exports.getUserProfileFromUserName = async (req, res) => {
  const userName = req.params.username;
  try {
    if (!userName) {
      const error = new Error("Add /username na");
      error.statusCode = 401;
      throw error;
    }
    const users = await User.find();
    const user = users.find(
      (user) => user.username.toLowerCase() === userName.toLowerCase()
    );
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }
    const profileToReturn = extractProfile(user, req);
    res.status(200).json(profileToReturn);
  } catch (err) {
    catchError(err, res);
  }
};

exports.getUserSuggestions = async (req, res) => {
  try {
    const posts = await Post.find();
    const user = await User.findById(req.userId);
    let allUsers = await User.find();
    const allUsers1 = allUsers.filter(
      (thisUser) =>
        thisUser.id !== user.id && !thisUser.followers.includes(req.userId)
      //
    );
    const allUsers2 = allUsers1.sort((first, second) => {
      const firstLength = posts.filter(
        (thisPost) => thisPost.author.toString() === first.id
      ).length;

      const secondLength = posts.filter(
        (thisPost) => thisPost.author.toString() === second.id
      ).length;

      return firstLength > secondLength ? -1 : 1;
    });
    const toReturn = extractSuggestionsInfo(allUsers2, req.userId);

    res.status(200).json({ users: toReturn.slice(0, 5) });
  } catch (err) {
    catchError(err, res);
  }
};

exports.checkUserName = async (req, res) => {
  const username = req.query.username || "cvbsbsvbsvbssk";
  if (username === "cvbsbsvbsvbssk") {
    return res.status(422).json({ status: 422, message: "Add username boss" });
  }
  try {
    const users = await User.find();
    const found = users.find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
    if (!found) {
      return res
        .status(200)
        .json({ status: 204, message: "User does not exist" });
    }
    res.status(200).json({ status: 200, message: "User exists!" });
  } catch (err) {
    catchError(err, res);
  }
};


exports.searchForUser = async (req, res) => {
  try {
    const isValid = isValidObjectId(req.userId);
    const string = req.query.search;
    const users = await User.find();
    let found = users.filter(
      (user) => {
        const stringLength = string.length;
        const partOf = user.username.toLowerCase().substring(0, stringLength) === string.toLowerCase() 
        || user.name.toLowerCase().substring(0, stringLength) === string.toLowerCase();
        return partOf;
      });
    if (isValid) {
      found.sort((user1) => {
        return user1.following.includes(req.userId) ? -1 : 1
      })
    }
    const toReturn = found.map((ele) => {
      return {
        username: ele.username,
        name: ele.name,
        displayUrl: ele.displayUrl
      }
    })
    res.status(200).json({ status: 200, users: toReturn });     
  } catch (err) {
    catchError(err, res);
  }

};