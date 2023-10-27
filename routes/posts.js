const Post = require("../models/Post");
const User = require("../models/User");
const router = require("express").Router();

// CREATE A POST
router.post("/", async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const result = await newPost.save();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE A POST
router.patch("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (req.body.userId === post.userId) {
      await post.updateOne(req.body);
      res.status(200).json("The post is updated");
    } else {
      res.status(403).json("You can only update your posts");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE A POST
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (req.body.userId === post.userId) {
      await post.deleteOne();
      res.status(200).json("The post is deleted");
    } else {
      res.status(403).json("You can only delete your posts");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// LIKE/DISLIKE A POST
router.patch("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.userId !== req.body.userId) {
      if (!post.likes.includes(req.body.userId)) {
        await post.updateOne({ $push: { likes: req.body.userId } });
        res.status(200).json("The post has been liked");
      } else {
        await post.updateOne({ $pull: { likes: req.body.userId } });
        res.status(200).json("The post has been disliked");
      }
    } else {
      res.status(403).json("You can't like or dislike yourself");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET TIMELINE POSTS
router.get("/timeline/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: user._id });
    const friendPosts = await Promise.all(
      user.followings.map(friendId => Post.find({ userId: friendId }))
    );
    res.status(200).json(
      userPosts.concat(...friendPosts).sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
    );
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL POSTS
router.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const userPosts = await Post.find({ userId: user._id });
    res.status(200).json(userPosts);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET A POST
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
