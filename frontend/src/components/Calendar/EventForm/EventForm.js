import { React, useState } from 'react';
import styles from './EventForm.module.css';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAlignLeft,
  faClock,
  faEnvelope,
  faCalendar,
} from '@fortawesome/free-solid-svg-icons';
import { useSelector, useDispatch } from 'react-redux'; //To manage Global State of Redux
import { toggle } from '../../../slices/ShowModalSlice'; //Import toggle function to turn on/off Modal
import { set, add, remove, update } from '../../../slices/MonthEventsSlice';

const EventForm = () => {
  const dispatch = useDispatch(); //dispatch is to use function to interact with State of Redux
  const exampleTokenForPhuoc =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0OWE0YTA3MDBkNWM1MDUzMjM3ZTZiMiIsImlhdCI6MTY4ODExNDI0MSwiZXhwIjoxNjkwNzA2MjQxfQ.5KPUaiZJAXMgoEtDXDPM8srQb6-y_GhE-5ZJGffgDy0';
  // 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0N2MxMDRmYzlkMzVkYTI2ZmMyODc0MSIsImlhdCI6MTY4NzQwMTkxNywiZXhwIjoxNjg5OTkzOTE3fQ.JsBEi0kmi7NygvHCZiwmQecP-6T0njtEb6DcVT14WpQ';
  //Example token to pass protect in backend route (We'll delete it later)
  const [eventsData, setEventsData] = useState([]); //EventData is a state
  const [formData, setFormData] = useState({
    name: '',
    describe: '',
    start: null,
    end: null,
    invitedInput: null,
    invited: [],
  });

  const [invitedGuest, setInvitedGuest] = useState([]); //state to store all of emails in an array

  const handleChange = e => {
    console.log('input infor', e);
    const name = e.target.name;
    const value = e.target.value;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async event => {
    event.preventDefault();
    console.log(event);
    dispatch(toggle());
    try {
      const response = await axios
        .post('http://localhost:5000/api/events/create', formData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${exampleTokenForPhuoc}`,
          },
        })
        .then(response => {
          console.log('Response:', response);
          dispatch(add(response.data));
        });
    } catch (error) {
      console.log(
        'There is an error when try to send POST REQUEST to http://localhost:5000/api/events/create',
      );
      console.log('ERROR: ', error);
    }
  };

  const handleAddGuest = () => {
    console.log(123);
    let newGuest = formData.invitedInput;
    setInvitedGuest(oldArray => [...oldArray, formData.invitedInput]);
    setFormData(prevData => ({
      //keep everything and change invitedInput to ''
      ...prevData,
      invited: [...prevData.invited, newGuest],
      invitedInput: '',
    }));
  };
  return (
    <div>
      <form onSubmit={handleSubmit} className={styles.form} id="my-form">
        <input
          type="text"
          id="title"
          name="name"
          placeholder="Add Title"
          autoFocus
          className={styles.input}
          value={formData.name}
          onChange={handleChange}
        />
        <span className={styles.buttonGroup}>
          <button className={styles.typeButton}>Event</button>
          <button className={styles.typeButton}>Task</button>
          <button className={styles.typeButton}>Reminder</button>
        </span>
        <br />
        <div className={styles.formRow}>
          <div className={styles.labelColumn}>
            {/* <FontAwesomeIcon icon={faAlignLeft} className={styles.icon} /> */}
            <label className={styles.label} htmlFor="descriptionInput">
              <FontAwesomeIcon icon={faAlignLeft} className={styles.icon} />
              Description
            </label>
            <label className={styles.label} htmlFor="startInput">
              <FontAwesomeIcon icon={faCalendar} className={styles.icon} />
              Start
            </label>
            <label className={styles.label} htmlFor="endInput">
              <FontAwesomeIcon icon={faClock} className={styles.icon} />
              End
            </label>
            <label className={styles.label} htmlFor="emailInput">
              <FontAwesomeIcon icon={faEnvelope} className={styles.icon} />
              Invite Guest
            </label>
          </div>

          <div className={styles.inputColumn}>
            <input
              type="text"
              id="descriptionInput"
              name="describe"
              placeholder="Describe your event"
              value={formData.describe}
              onChange={handleChange}
              className={styles.input}
            />
            <input
              type="datetime-local"
              id="startInput"
              name="start"
              value={formData.start}
              onChange={handleChange}
              className={styles.input}
            />
            <input
              type="datetime-local"
              id="endInput"
              name="end"
              value={formData.end}
              onChange={handleChange}
              className={styles.input}
            />
            <input
              type="email"
              id="emailInput"
              name="invitedInput"
              placeholder="Invite Guests"
              value={formData.invitedInput}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
        </div>
        <button
          type="button"
          className={` btn btn-primary ${styles.addGuestButton}`}
          onClick={handleAddGuest}
        >
          Add Guest
        </button>{' '}
        {/* Button to add Guest  */}
        <div className={styles.emailList}>
          {invitedGuest.map(email => (
            <div className={styles.invitedEmail}>{email}</div>
          ))}
        </div>
      </form>

      <div className={styles.submitContainer}>
        <button type="submit" className={styles.submitButton} form="my-form">
          {' '}
          {/* Form attribute to connect with form, because this button is outside of form */}
          Submit
        </button>
      </div>
    </div>
  );
};

export default EventForm;
