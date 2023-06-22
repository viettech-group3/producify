// Create Event routers
const express = require('express');
const {
  createEvent,
  getAllEvents,
  modifyEvent,
  finishEvent,
} = require('../controllers/Event');
const { protect } = require('../utils/auth');
const {
  invitedUserEmails,
  updateInvitationStatus,
  getPendingInvitations,
} = require('../controllers/EventParticipation');
const EventRouter = express.Router();

// Set up routes
EventRouter.post('/create', protect, createEvent);
EventRouter.post('/invite/:id', protect, invitedUserEmails);
EventRouter.get('/get', protect, getAllEvents);
EventRouter.put('/modify/:id', protect, modifyEvent);
EventRouter.post('/finish/:id', protect, finishEvent);
EventRouter.put('/updateStatus/:id', protect, updateInvitationStatus);
EventRouter.get('/getPending', protect, getPendingInvitations);

module.exports = EventRouter;
