
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
      select: {
        userId: true,
        fullName: true,
        email: true,
        passwordHash: true,
        createdAt: true,
      },
    });
  }

  async findById(userId: number) {
    return this.usersRepository.findOne({
      where: { userId },
    });
  }

  async create(
    fullName: string,
    email: string,
    passwordHash: string,
  ) {
    const user = this.usersRepository.create({
      fullName,
      email,
      passwordHash,
    });

    return this.usersRepository.save(user);
  }

  async count() {
    return this.usersRepository.count();
  }
}
