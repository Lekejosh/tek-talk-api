const { catchError } = require("../utils/catch-error");
const User = require("../models/user");
const fs = require("fs");
const { isValidObjectId } = require("mongoose");
const { validationResult } = require("express-validator");

const extractProfile = (user) => {
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
    name,
    username,
    stack,
    location,
    email,
    bio,
    followingCount: user.following.length,
    followersCount: user.followers.length,
    verified,
  };
  if (displayLocal || displayUrl) {
    const fileExists = fs.existsSync(displayLocal);
    profileToReturn.displayUrl = fileExists ? displayLocal : displayUrl;
  } else {
    profileToReturn.displayUrl = null;
  }
  if (backdropLocal || backdropUrl) {
    const fileExists = fs.existsSync(backdropLocal);
    profileToReturn.backdropUrl = fileExists ? backdropLocal : backdropUrl;
  } else {
    profileToReturn.backdropUrl = null;
  }
  return profileToReturn;
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
    const profileToReturn = extractProfile(user);
    res.status(200).json(profileToReturn);
  } catch (err) {
    catchError(err, res);
  }
};

exports.getUserProfileFromUserName = async (req, res) => {
  try {
    const userName = req.params.username;
    if (!userName) {
      const error = new Error("Add /username na");
      error.statusCode = 401;
      throw error;
    }
    const user = await User.findOne({ username: userName });
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }
    const profileToReturn = extractProfile(user);
    res.status(200).json(profileToReturn);
  } catch (err) {
    catchError(err, res);
  }
};

exports.getUserProfileFromId = async (req, res) => {
  try {
    const id = req.params.id;
    const isValid = isValidObjectId(id);
    console.log(id, isValid);
    if (!id || !isValid) {
      const error = new Error("Errmm. id is not valid");
      error.statusCode = 401;
      throw error;
    }
    const user = await User.findById(id);
    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      throw error;
    }
    const profileToReturn = extractProfile(user);
    res.status(200).json(profileToReturn);
  } catch (err) {
    catchError(err, res);
  }
};
