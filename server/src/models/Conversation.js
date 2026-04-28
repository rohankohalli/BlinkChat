export const ConversationSchema = {
  tableName: 'conversations',
  participantTable: 'conversation_participants',
  fields: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    type: "ENUM('direct', 'group', 'ephemeral') NOT NULL",
    name: 'VARCHAR(100) NULL',
    ttl_hours: 'INT NULL',
    room_code: 'VARCHAR(8) UNIQUE NULL',
    created_by: 'INT NULL',
    last_message_at: 'DATETIME NULL',
    expires_at: 'DATETIME NULL',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
  }
};
