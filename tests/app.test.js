const db = require('../src/utils/db');

describe('User Utils', () => {
  test('should get user by id', (done) => {
    db.getUser(1, (err, user) => {
      expect(err).toBeNull();
      expect(user.id).toBe(1);
      expect(user.name).toBe('admin');
      done();
    });
  });

  test('should find user by name', (done) => {
    db.findUserByName('admin', (err, users) => {
      expect(err).toBeNull();
      expect(users.length).toBe(1);
      expect(users[0].name).toBe('admin');
      done();
    });
  });
});
