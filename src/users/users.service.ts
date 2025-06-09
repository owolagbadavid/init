import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/db/entities';
import { UserProfile } from 'src/db/entities/user-profile.entity';
import { GetUserProfileDto, UpdateUserProfile } from 'src/models/user/user.dto';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepo: Repository<UserProfile>,
  ) {}

  async userNameExists(username: string): Promise<boolean> {
    const user = await this.userRepo.findOne({
      where: { username },
      select: ['id'],
    });
    return !!user;
  }

  async changeUsername(userId: string, newUsername: string): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existingUser = await this.userRepo.findOne({
      where: { username: newUsername },
      select: ['id'],
    });

    if (existingUser && existingUser.id !== userId) {
      throw new ConflictException('Username already exists');
    }
    user.username = newUsername.trim().toUpperCase();
    return this.userRepo.save(user);
  }

  async updateUserProfile(
    userId: string,
    profileData: UpdateUserProfile,
  ): Promise<void> {
    const userProfile = await this.userProfileRepo.findOne({
      where: { userId },
    });
    if (!userProfile) {
      throw new NotFoundException('User profile not found');
    }

    await this.userProfileRepo.save({
      ...userProfile,
      ...profileData,
    });
  }

  async getUserProfile(userId: string): Promise<GetUserProfileDto> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: {
        profile: {
          firstName: true,
          lastName: true,
          avatar: true,
        },
        id: true,
        username: true,
        emailAddress: true,
      },
      relations: {
        profile: true, // Ensure the profile is loaded
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return {
      firstName: user.profile?.firstName,
      lastName: user.profile?.lastName,
      avatar: user.profile?.avatar,
      username: user.username,
      emailAddress: user.emailAddress,
    };
  }
}
