const { body, validationResult } = require("express-validator");
const { isValidObjectId } = require("mongoose");
const fs = require("fs");

const Comment = require("../models/comment");
const Like = require("../models/like");
const Post = require("../models/post");

const { catchError } = require("../utils/catch-error");
const { uploadFile, uploadToCloudinary } = require("../utils/cloudinary");

const extractPostDetails = (posts, postsToSend, req) => {
  posts.forEach((post) => {
    let postToSend = {
      postId: post.id,
      authorId: post.author.id,
      username: post.author.username,
      name: post.author.name,
      commentCount: post.comments.length,
      likeCount: post.likes.length,
      postedIn: post.category,
      postBody: post.body,
      postDate: post.createdAt,
      images: [],
    };

    post.imagesLocal.forEach((img) => {
      const fileExists = fs.existsSync(img);

      if (fileExists) {
        postToSend.images.push("https://" + req.headers.host + "/" + img);
      } else {
        postToSend.images.push(...post.imagesUrl);
      }
    });
    postsToSend.push(postToSend);
  });
};

exports.postPost = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: 422,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  try {
    const { body, category } = req.body;
    const post = new Post({
      body,
      category,
      author: req.userId,
      imagesLocal: [],
      imagesUrl: [],
      imagesId: [],
      comments: [],
      likes: [],
    });
    const uploadedImages = req.files;
    uploadedImages.forEach((imgData) => {
      const imageLocalPath = imgData.path.replace("\\", "/");
      post.imagesLocal.push(imageLocalPath);
    });
    await post.save();
    res
      .status(200)
      .json({ status: 200, message: "Posted Successfully!", postId: post.id });
    uploadedImages.forEach((imgData) => {
      uploadToCloudinary(imgData.path, post.id);
    });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getPostFromUserId = async (req, res) => {
  try {
    const id = req.params.id;
    const filter = req.body.filter;

    const isValid = isValidObjectId(id);
    if (!id || !isValid) {
      return res.status(422).json({ status: 422, message: "Invalid user id" });
    }
    let posts = await Post.find({
      author: id,
    }).populate("author");
    if (!posts) {
      return res.status(422).json({ status: 422, message: "Post not found" });
    }
    if (filter) {
      posts = posts.filter((post) => filter.includes(post.category));
    }
    let postsToSend = [];
    extractPostDetails(posts, postsToSend, req);
    res.status(200).json({ status: 200, posts: postsToSend });
  } catch (err) {
    catchError(err, res);
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    let posts = await Post.find().populate("author");
    const filter = req.body.filter;
    console.log(filter);
    if (filter) {
      console.log(posts);
      posts = posts.filter((post) => filter.includes(post.category));
    }
    let postsToSend = [];
    extractPostDetails(posts, postsToSend, req);
    res.status(200).json({ status: 200, posts: postsToSend });
  } catch (err) {
    catchError(err, res);
  }
};
