import { Admin } from './admin';

describe('Admin', () => {
  let admin: Admin;

  beforeEach(() => {
    admin = new Admin("name", 1);
  });

  it('should create an instance', () => {
    expect(admin).toBeTruthy();
  });
});
