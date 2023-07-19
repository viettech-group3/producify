// Create User routers
const express = require('express');
const UserRouter = express.Router();
const {
  signUp,
  login,
  leaderboard,
  getUser,
  updateUser,
  getAvatars,
  forgotPassword,
  resetPassword,
  getLabelList,
  addLabelList,
  deleteLabelList,
  deductPoints,
} = require('../controllers/User');
const { protect } = require('../utils/auth');
const User = require('../models/User');

// Set up routes
UserRouter.post('/', signUp);
UserRouter.post('/forgotpassword', forgotPassword);
UserRouter.post('/resetpassword', resetPassword);
UserRouter.post('/login', login);
UserRouter.get('/leaderboard', leaderboard);
UserRouter.get('/getUser', protect, getUser);
UserRouter.put('/update', protect, updateUser);
UserRouter.get('/getAvatars', protect, getAvatars);
UserRouter.get('/getLabelList', protect, getLabelList);
UserRouter.post('/addLabelList', protect, addLabelList);
UserRouter.delete('/deleteLabelList', protect, deleteLabelList);
UserRouter.put('/deduct', protect, deductPoints);
module.exports = UserRouter;
