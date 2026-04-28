export const MessageSchema = {
  tableName: 'messages',
  fields: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    conversation_id: 'INT NOT NULL',
    sender_id: 'INT NOT NULL',
    content: 'TEXT NOT NULL',
    type: "ENUM('text', 'system') DEFAULT 'text'",
    created_at: 'DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)'
  }
};
