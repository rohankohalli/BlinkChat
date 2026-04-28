export const UserSchema = {
  tableName: 'users',
  fields: {
    id: 'INT AUTO_INCREMENT PRIMARY KEY',
    username: 'VARCHAR(50) UNIQUE NOT NULL',
    email: 'VARCHAR(255) UNIQUE NOT NULL',
    password_hash: 'VARCHAR(255) NOT NULL',
    avatar: "VARCHAR(20) DEFAULT 'avatar_1'",
    status: "ENUM('online', 'offline', 'away') DEFAULT 'offline'",
    last_seen: 'DATETIME NULL',
    created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
  }
};
