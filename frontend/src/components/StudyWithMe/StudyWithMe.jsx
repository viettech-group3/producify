import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './StudyWithMe.module.css';
import icon from '../../assets/images/addicon.png';

function StudyWithMe() {
  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user.username;
  const [roomname, setRoomname] = useState('');
  const [activeRooms, setActiveRooms] = useState([]);
  const navigate = useNavigate();
  const importAll = requireContext => requireContext.keys().map(requireContext);
  const roomImages = importAll(
    require.context('../../assets/images', false, /\.(png|jpe?g|svg)$/),
  );

  useEffect(() => {
    const fetchActiveRooms = async () => {
      const response = await axios.get(
        'http://localhost:8080/api/studywithme/activeRoom',
      );
      setActiveRooms(response.data.activeRooms);
    };

    fetchActiveRooms();
  }, []);

  const handleCreateRoom = async (username, roomname) => {
    const config = {
      headers: {
        'Content-type': 'application/json',
      },
    };
    // Send username and roomname to the backend to generate a token
    console.log(username, roomname);
    const response = await axios.post(
      'http://localhost:5000/api/studywithme/generateToken',
      {
        userName: username,
        roomName: roomname,
        // coverImage: roomImages[Math.floor(Math.random() * roomImages.length)],
        // coverImage: roomImages[0],
      },
      config,
    );

    const { token } = response.data;

    // Redirect the user to the generated token route
    navigate(`/studywithme/${token}`);
  };

  const handleJoinRoom = async (username, roomname) => {
    // Send username and roomname to the backend to generate a token
    const response = await axios.post(
      'http://localhost:8080/api/studywithme/generateToken',
      {
        userName: username,
        roomName: roomname,
        // coverImage: roomImages[Math.floor(Math.random() * roomImages.length)],
        // coverImage: roomImages[0],
      },
    );

    const { token } = response.data;

    // Redirect the user to the generated token route
    navigate(`/studywithme/${token}`);
  };

  return (
    <div className={styles.studyWithMeContainer}>
      <div className={styles.createRoomContainer}>
        <div className={styles.title}>Create New Room</div>
        <div className={styles.inputContainer}>
          {/* <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          /> */}
          <input
            type="text"
            placeholder="Enter room name"
            value={roomname}
            onChange={e => setRoomname(e.target.value)}
          />

          <div
            className={`${styles.icon_sentence} d-flex align-items-center mt-4`}
            onClick={() => {
              handleCreateRoom(userName, roomname);
            }}
          >
            {/* <img src={icon} alt="Add Icon" className={styles.icon} /> */}
            <span className={styles.sentence}>Create Room</span>
          </div>
        </div>
      </div>

      <div className={styles.activeRoomsContainer}>
        <div className={styles.title}>Join Active Rooms</div>
        {activeRooms.length ? (
          <ul>
            {activeRooms.map(room => (
              <li key={room.name}>
                <div className={styles.roomDetails}>
                  {/* <img src={room.coverImage} alt="Room Cover" /> */}
                  <span>{room.name}</span>
                  <h1>{room.attendees}</h1>
                </div>
                <button
                  className={styles.joinButton}
                  onClick={() => handleCreateRoom(userName, room.name)}
                >
                  Join Room
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No active rooms</p>
        )}
      </div>
    </div>
  );
}

export default StudyWithMe;
