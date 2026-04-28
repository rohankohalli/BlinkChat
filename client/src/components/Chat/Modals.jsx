import React from 'react';
import { styles } from '../../pages/Dashboard.styles';

export const CreateRoomModal = ({ show, onClose, onCreate, roomName, setRoomName }) => {
  if (!show) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3>Create New Room</h3>
        <p>Ephemeral rooms expire after 24 hours of inactivity.</p>
        <form onSubmit={onCreate}>
          <input
            autoFocus
            style={styles.modalInput}
            placeholder="Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.ghostButton}>Cancel</button>
            <button type="submit" style={styles.primaryButton}>Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const JoinRoomModal = ({ show, onClose, onJoin, roomCode, setRoomCode }) => {
  if (!show) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <h3>Join Room</h3>
        <p>Enter the room code shared with you.</p>
        <form onSubmit={onJoin}>
          <input
            autoFocus
            style={styles.modalInput}
            placeholder="Room Code (e.g. AB1234)"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          />
          <div style={styles.modalActions}>
            <button type="button" onClick={onClose} style={styles.ghostButton}>Cancel</button>
            <button type="submit" style={styles.primaryButton}>Join</button>
          </div>
        </form>
      </div>
    </div>
  );
};
