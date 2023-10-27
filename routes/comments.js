const Comment = require("../models/Comment");
const Post = require("../models/Post");
const router = require("express").Router();

// CREATE A POST
router.post("/", async (req, res) => {
  try {
    const post = await Post.findById(req.body.postId);
    const newComment = new Comment(req.body);
    const comment = await newComment.save();
    await post.updateOne({ $push: { comments: comment._id } });
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE A COMMENT
router.patch("/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (req.body.userId === comment.userId) {
      await comment.updateOne(req.body);
      res.status(200).json("The comment is updated");
    } else {
      res.status(403).json("You can only update your comments");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE A POST
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.body.postId);
    const comment = await Comment.findById(req.params.id);
    if (req.body.userId === comment.userId) {
      console.log(post.comments);
      await post.updateOne({ $pull: { comments: comment._id } });
      await comment.deleteOne();
      res.status(200).json("The comment is deleted");
    } else {
      res.status(403).json("You can only delete your comments");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET POST'S ALL COMMENTS
router.get("/all/:postId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    const postComments = await Promise.all(
      post.comments.map(comment => Comment.findById(comment))
    );

    res.status(200).json(
      postComments.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      })
    );
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET A COMMENT
router.get("/:id", async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    res.status(200).json(comment);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
