const Event = require('../models/Event');
const EventParticipation = require('../models/EventParticipation');
const User = require('../models/User');
const { invite } = require('../utils/invite');
const { points } = require('../utils/points');

// Create a new event function
const createEvent = async (req, res) => {
  try {
    const { name, describe, start, end, invited } = req.body;
    let creatorId = req.user._id;

    // Create a new event and save
    const event = new Event({
      name: name,
      describe: describe,
      start: start,
      end: end,
    });
    await event.save();

    // Create a new event participation for the creator
    const creatorParticipation = new EventParticipation({
      eventId: event._id,
      userId: creatorId,
      status: 'accepted',
    });
    await creatorParticipation.save();
    //Add a populate below this code to ref userId into email in database

    // Invited is an array of emails
    if (invited) {
      // Create a new event participation for the invited users by mapping
      const invitedParticipation = invited.map(
        async email => await invite(email, event._id), // a bunch of promises in an array
      );
      //Make sure all promise is fullfilled
      await Promise.all(invitedParticipation);
    }
    res.status(201).json(event.toJSON());
  } catch (error) {
    console.log(`Failed to create event: ${error}`);
    res.status(500).json({ error: error });
  }
};

/**
 * Controller function to get events of a user
 * Name: getAllEvents
 * Asignee: Phuoc
 * req: request object containing user id.
 * res: response object to return status 200 and events array.
 */
const getAllEvents = async (req, res) => {
  try {
    const userId = req.user._id; //Fetch the UserId of current User
    const participation = await EventParticipation.find({
      //Find in EventParticipation, which Participation have the same userId with current user, and status is "accepted"
      userId: userId,
      status: 'accepted',
    });
    const eventsIdOfThisUser = participation.map(eventParticipation => {
      //After have the EventParticipation, we can access t
      return eventParticipation.eventId;
    });

    const eventsOfThisUser = await Promise.all(
      //We need this line beacuse Event.find() is a Promise (it can be success or failed), this line only accept success Promise
      eventsIdOfThisUser.map(async id => {
        return await Event.find({
          _id: id,
          status: { $in: ['overdue', 'ongoing'] },
        }); // return an array
      }),
    );

    const flattenedEvents = eventsOfThisUser.flat(); // Flattens the array of arrays

    res.status(200).json(flattenedEvents);
  } catch (error) {
    console.log('Failed to fetch all events from database');
    res.status(500).json({ error: error });
  }
};


//Add this events to display on MOnth View
const getAllEventsToday = async (req, res) => {
  try {
    const currentDate = new Date(req.query.currentDate);
    const userId = req.user._id;

    const participation = await EventParticipation.find({
      userId: userId,
      status: 'accepted',
    });

    const eventsIdOfThisUser = participation.map(eventParticipation => {
      return eventParticipation.eventId;
    });

    const eventsOfThisUser = await Event.find({
      _id: { $in: eventsIdOfThisUser },
      status: { $in: ['overdue', 'ongoing'] },
    });

    const todayEvents = eventsOfThisUser.filter(event => {
      const start = new Date(event.start);
      const end = new Date(event.end);
      const startOfCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 1);
      const endOfCurrentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999);
      console.log(start, end, startOfCurrentDate, endOfCurrentDate, "Date is: ", event.start.toString(), event.end.toString())
      const minTime = Math.min(start.getTime(), end.getTime(), startOfCurrentDate.getTime(), endOfCurrentDate.getTime())
      const maxTime = Math.max(start.getTime(), end.getTime(), startOfCurrentDate.getTime(), endOfCurrentDate.getTime())
      return ((maxTime - minTime) < 24 * 60 * 60 * 1000 + (end.getTime() - start.getTime()));
    });


    res.status(200).json(todayEvents);
  } catch (error) {
    console.log('Failed to fetch all TODAY events from the database:', error.message);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};


const getAllEventsMonths = async (req, res) => {
  try {
    let startDate = new Date(req.query.startDate);
    let endDate = new Date(req.query.endDate);
    console.log(startDate, endDate)
    const userId = req.user._id; //Fetch the UserId of current User
    const participation = await EventParticipation.find({
      //Find in EventParticipation, which Participation have the same userId with current user, and status is "accepted"
      userId: userId,
      status: 'accepted',
    });
    const eventsIdOfThisUser = participation.map(eventParticipation => {
      //After have the EventParticipation, we can access t
      return eventParticipation.eventId;
    });

    const eventsOfThisUser = await Promise.all(
      //We need this line beacuse Event.find() is a Promise (it can be success or failed), this line only accept success Promise
      eventsIdOfThisUser.map(async id => {
        return await Event.find({
          _id: id,
          status: { $in: ['overdue', 'ongoing'] },
        }); // return an array
      }),
    );
    const flattenedEvents = eventsOfThisUser.flat(); // Flattens the array of arrays (of this user's events), make 2D array become 1D array
    const monthEvents = flattenedEvents.filter(event => {
      const startOfEvent = new Date(event.start);
      const endOfEvent = new Date(event.end);
      const startOfCurrentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, 0, 0, 1);
      const endOfCurrentMonth = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999);
      console.log(startOfEvent, endOfEvent, startOfCurrentMonth, endOfCurrentMonth, "Date is: ", event.start.toString(), event.end.toString())
      return (startOfEvent <= endOfCurrentMonth && endOfEvent >= startOfCurrentMonth);
    });


    res.status(200).json(monthEvents);
  } catch (error) {
    console.log('Failed to fetch all Month events from database');
    res.status(500).json({ error: error });
  }
};



/**
 * Controller function to modify event of a user
 * Asignee: chi Jenny
 * Name: modifyEvent
 * req: request object containing user id, event id, and new event info. For example, new description.
 * res: response object to return status 200.
 */
const modifyEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { updatedData } = req.body;

    // check if user is the creator? -> might change schema for event
    // anyone can change for now

    const event = await Event.findByIdAndUpdate(
      { _id: eventId },
      { $set: updatedData },
      { new: true },
    );

    res.status(200).json({ event: event });
  } catch (error) {
    console.log(`Failed to modify event: ${error}`);
    res.status(500).json({ error: error });
  }
};

/**
 * Controller function when a user finish an event
 * Asignee: chi Jenny
 * Name: finishEvent
 * req: request object containing user id and event id.
 * res: response object to return status 200.
 */
/**
 * NOTES:
 * - might implement time caped. Rigth now, expected that start and end time is in the same day
 * - anyone can click finish for now
 */

const finishEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    // the point will only be distributed if user finish the event before the end time

    const event = await Event.findById(eventId);

    // if event is completed, wont do anything
    if (event.status === 'completed') {
      res.status(400).json({ message: 'Event already completed' });
    }

    // Find EventParticipation of the users with that event ID and status == accepted,
    // then for each Event Participation, update the point of that user

    const participation = await EventParticipation.find({
      eventId: eventId,
      status: 'accepted',
    });

    const updatedEvents = participation.map(participation => {
      return User.findByIdAndUpdate(
        { _id: participation.userId },
        { $inc: { points: points(event.start, event.end) } },
        { new: true },
      );
    });
    await Promise.all(updatedEvents);

    await Event.findByIdAndUpdate(
      { _id: eventId },
      { status: 'completed' },
      { new: true },
    );

    res.status(200).json({ event: event });
  } catch (error) {
    console.log(`Failed to modify event: ${error}`);
    res.status(500).json({ error: error });
  }
};

/**
 * Check for overdued event and change status accordingly
 * Asignee: Dang
 * Name: finishEvent
 * req: request object containing event id.
 * res: response object to return status 200.
 */
const checkIfEventOverdue = async (req, res) => {
  try {
    const eventId = req.params.id;
    const timeNow = new Date();
    const event = await Event.findById(eventId);
    if (event.status === 'completed' || event.status === 'overdue') {
      res.status(200).json('Event is already completed or overdue');
    } else {
      if (event.end.getTime() < timeNow.getTime()) {
        await Event.findByIdAndUpdate(
          { _id: eventId },
          { $set: { status: 'overdue' } },
          { new: true },
        );
        res.status(200).json('Event is overdue');
      }
    }
  } catch (error) {
    console.log(`Failed to modify event: ${error}`);
    res.status(500).json({ error: error });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getAllEventsToday,
  getAllEventsMonths,
  modifyEvent,
  finishEvent,
  checkIfEventOverdue
};
