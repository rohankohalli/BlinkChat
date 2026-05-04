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
export const InviteModal = ({ 
  show, 
  onClose, 
  onInvite, 
  onAddFriend,
  searchTerm, 
  setSearchTerm, 
  users, 
  friends = [],
  loadingSearch 
}) => {
  if (!show) return null;

  return (
    <div style={styles.modalOverlay}>
      <div style={{...styles.modal, width: '380px'}}>
        <h3>Manage Room & Friends</h3>
        <p>Search users or select from your friends list.</p>
        <input
          autoFocus
          style={styles.modalInput}
          placeholder="Search username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div style={{ maxHeight: '250px', overflowY: 'auto', marginTop: '15px' }}>
          {loadingSearch ? (
            <div style={{ textAlign: 'center', padding: '10px', color: '#888' }}>Searching...</div>
          ) : searchTerm.trim().length >= 2 ? (
            // Search Results
            users.length > 0 ? (
              users.map(u => {
                const isFriend = friends.some(f => f.id === u.id);
                return (
                  <div key={u.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border-light)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '50%', 
                        background: 'var(--bg-input)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center', fontSize: '12px' 
                      }}>
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{u.username}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {!isFriend && (
                        <button 
                          onClick={() => onAddFriend(u.id)}
                          style={{...styles.secondaryButton, padding: '4px 8px', fontSize: '11px'}}
                        >Add Friend</button>
                      )}
                      <button 
                        onClick={() => onInvite(u.id)}
                        style={{...styles.primaryButton, padding: '4px 12px', fontSize: '11px'}}
                      >Invite</button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ textAlign: 'center', padding: '10px', color: '#888' }}>No users found</div>
            )
          ) : (
            // Friends List (Default)
            <>
              {friends.length > 0 ? (
                <>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px' }}>YOUR FRIENDS</div>
                  {friends.map(f => (
                    <div key={f.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid var(--border-light)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ 
                          width: '32px', height: '32px', borderRadius: '50%', 
                          background: 'var(--bg-input)', display: 'flex', 
                          alignItems: 'center', justifyContent: 'center', fontSize: '12px' 
                        }}>
                          {f.username.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{f.username}</span>
                      </div>
                      <button 
                        onClick={() => onInvite(f.id)}
                        style={{...styles.primaryButton, padding: '4px 12px', fontSize: '11px'}}
                      >Invite</button>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '10px', color: '#888', fontSize: '12px' }}>
                  Search for users to add them as friends!
                </div>
              )}
            </>
          )}
        </div>

        <div style={styles.modalActions}>
          <button type="button" onClick={onClose} style={styles.ghostButton}>Close</button>
        </div>
      </div>
    </div>
  );
};
