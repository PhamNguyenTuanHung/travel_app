class UserMapper {
  toDTO(user) {
    if (!user) return null;
    const { password_hash, ...cleanUser } = user;
    return cleanUser;
  }

  toDTOs(users) {
    if (!Array.isArray(users)) return [];
    return users.map(user => this.toDTO(user));
  }
}

module.exports = new UserMapper();
