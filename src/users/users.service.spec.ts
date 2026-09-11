import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service.js';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService();
  });

  it('creates and finds a user', () => {
    const created = service.create({
      name: '홍길동',
      email: 'hong@example.com',
    });
    expect(service.findOne(created.id)).toEqual(created);
  });

  it('throws when the user does not exist', () => {
    expect(() => service.findOne('missing-id')).toThrow(NotFoundException);
  });

  it('removes a user', () => {
    const created = service.create({
      name: '홍길동',
      email: 'hong@example.com',
    });
    service.remove(created.id);
    expect(service.findAll()).toHaveLength(0);
  });
});
