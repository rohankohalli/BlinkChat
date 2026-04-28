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
export const InviteModal = ({ show, onClose, onInvite, searchTerm, setSearchTerm, users, loadingSearch }) => {
  if (!show) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={{...styles.modal, width: '380px'}}>
        <h3>Invite Users</h3>
        <p>Search for users to invite to this conversation.</p>
        <input
          autoFocus
          style={styles.modalInput}
          placeholder="Search username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '15px' }}>
          {loadingSearch ? (
            <div style={{ textAlign: 'center', padding: '10px', color: '#888' }}>Searching...</div>
          ) : users.length > 0 ? (
            users.map(u => (
              <div key={u.id} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', 
                    background: 'rgba(255,255,255,0.1)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', fontSize: '12px' 
                  }}>
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ color: '#fff', fontSize: '14px' }}>{u.username}</span>
                </div>
                <button 
                  onClick={() => onInvite(u.id)}
                  style={{...styles.primaryButton, padding: '4px 12px', fontSize: '12px'}}
                >Invite</button>
              </div>
            ))
          ) : searchTerm.trim().length >= 2 ? (
            <div style={{ textAlign: 'center', padding: '10px', color: '#888' }}>No users found</div>
          ) : (
            <div style={{ textAlign: 'center', padding: '10px', color: '#888', fontSize: '12px' }}>
              Type at least 2 characters to search
            </div>
          )}
        </div>

        <div style={styles.modalActions}>
          <button type="button" onClick={onClose} style={styles.ghostButton}>Close</button>
        </div>
      </div>
    </div>
  );
};
