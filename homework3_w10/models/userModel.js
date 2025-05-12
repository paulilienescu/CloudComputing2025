class User {
  constructor(username, passwordHash) {
    this.username = username;
    this.passwordHash = passwordHash;
  }
}

module.exports = User;
