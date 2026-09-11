import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

// DB 연동 전까지 메모리 저장소로 동작하는 임시 구현. 추후 Repository로 교체.
@Injectable()
export class UsersService {
  private readonly users: User[] = [];

  create(dto: CreateUserDto): User {
    const user: User = {
      id: randomUUID(),
      name: dto.name,
      email: dto.email,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string): User {
    const user = this.users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  update(id: string, dto: UpdateUserDto): User {
    const user = this.findOne(id);
    Object.assign(user, dto);
    return user;
  }

  remove(id: string): void {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`User ${id} not found`);
    }
    this.users.splice(index, 1);
  }
}
