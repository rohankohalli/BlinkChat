export const InviteSchema = {
  tableName: 'invites',
  fields: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    conversation_id: 'INT NOT NULL',
    from_user_id: 'INT NOT NULL',
    to_user_id: 'INT NOT NULL',
    status: "ENUM('pending', 'accepted', 'declined') DEFAULT 'pending'",
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
  }
};
