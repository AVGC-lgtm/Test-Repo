// routes/feedbackRoutes.js
const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedbackController");
const { authenticateToken } = require("../middleware/auth");

// Destructure and make sure both upload and submitFeedback are correctly imported
const { submitFeedback } = feedbackController;

// POST route for submitting feedback, with multer image upload
router.post("/", submitFeedback);

// Apply authentication middleware to all feedback routes
router.use(authenticateToken);

// GET route to get all feedback
router.get("/", feedbackController.getAllFeedback);

// GET route to get feedback by ID
router.get("/:id", feedbackController.getFeedbackById);

// DELETE route to delete all feedback
router.delete("/", feedbackController.deleteAllFeedback);

// DELETE route to delete feedback by ID
router.delete("/:id", feedbackController.deleteFeedbackById);

module.exports = router;
