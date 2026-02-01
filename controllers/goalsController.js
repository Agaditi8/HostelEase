const Goal = require('../models/Goal');

exports.createGoal = async (req, res) => {
  try {
    const { title, description, targetAmount, savedAmount, isPriority } = req.body;

    // If new goal is priority, unset previous priority goals
    if (isPriority) {
      await Goal.updateMany({ isPriority: true }, { isPriority: false });
    }

    const newGoal = new Goal({ title, description, targetAmount, savedAmount, isPriority });
    await newGoal.save();

    res.status(201).json(newGoal);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getGoals = async (req, res) => {
  try {
    // Priority goal first, then others sorted by creation date
    const goals = await Goal.find().sort({ isPriority: -1, createdAt: -1 });
    res.json(goals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add this to your goalsController.js
exports.updateProgress = async (req, res) => {
  try {
    const { amountToAdd } = req.body;
    const goal = await Goal.findById(req.params.id);
    
    goal.savedAmount += Number(amountToAdd);
    await goal.save();
    
    res.json(priorityGoal);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};
