const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require("dotenv").config();
console.log("🔥 THIS IS THE SERVER FILE RUNNING");

// Import the route
const authRoutes = require('./routes/authRoutes'); 
const goalsRoutes = require('./routes/goalsRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/test', (req, res) => {
    res.send("Server is receiving POST requests!");
});
// Use the routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/expenses', expenseRoutes);

// mongodb
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));


app.listen(5000, () => console.log('🚀 Server running at http://localhost:5000'));




