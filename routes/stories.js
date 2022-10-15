const express = require("express");
const router = express.Router();
const { ensureAuth } = require("../middleware/auth");
const Story = require("../models/Story");

// @desc Show add page
// @route GET /stories/ad
router.get("/add", ensureAuth, (req, res) => {
  res.render("stories/add");
});

// @desc Processes add form
// @route POST /stories
router.post("/", ensureAuth, async (req, res) => {
  try {
    req.body.user = req.user.id;
    await Story.create(req.body);
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.render("errors/500");
  }
});

// @desc Show all stories
// @route POST /stories
router.get("/", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({ status: "public" })
      .populate("user")
      .sort({ createdAt: "desc" })
      .lean();
    res.render("stories/index", { stories });
  } catch (error) {
    console.log(error);
    res.render("error/500");
  }
});

// @desc Show single stories
// @route POST /stories
router.get("/:id", ensureAuth, async (req, res) => {
  try {
    let story = await Story.findById(req.params.id).populate("user").lean();

    if (!story) {
      return res.render("error/404");
    }
    res.render("stories/show", { story });
  } catch (error) {
    console.log(error);
    res.render("error/500");
  }
});

// @desc DELETE stories
// @route DELETE /stories
router.delete("/:id", ensureAuth, async (req, res) => {
  try {
    await Story.remove({ _id: req.params.id });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
    res.render("error/500");
  }
});

// @desc Show edit page
// @route GET /stories/edit
router.get("/edit/:id", ensureAuth, async (req, res) => {
  const story = await Story.findOne({
    _id: req.params.id,
  }).lean();

  if (!story) {
    res.render("error/404");
  }

  if (story.user != req.user.id) {
    res.redirect("/stories");
  } else {
    res.render("stories/edit", {
      story,
    });
  }
});

// @desc Update Story
// @route GET /stories/:id
router.put("/:id", ensureAuth, async (req, res) => {
  let story = await Story.findById(req.params.id).lean();
  if (!story) {
    return res.render("error/404");
  }

  if (story.user != req.user.id) {
    res.redirect("/stories");
  } else {
    story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, {
      new: true,
      runValidators: true,
    });

    res.redirect("/dashboard");
  }
});

router.get("/user/:userId", ensureAuth, async (req, res) => {
  try {
    const stories = await Story.find({
      user: req.params.userId,
      status: public,
    })
      .populate("user")
      .lean();

    res.render("stories/index");
  } catch (error) {
    console.log(error);
    res.render("error/500");
  }
});

module.exports = router;