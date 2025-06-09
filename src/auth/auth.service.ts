import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { PasswordHasher, SecurityService } from 'src/security/security.service';
import { LoginDto, LoginResponseDto } from './dtos/login.dto';
import { User, UserProfile } from 'src/db/entities';
import { StatusEnum } from 'src/models/enums';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/models/user/user.dto';
import { HelperService } from '../services/helper.service';
import { IdentifierEnum } from 'src/models/enums/identifier.enum';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly securityService: SecurityService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    let user: User | null;

    try {
      if (loginDto.emailAddress) {
        user = await this.userRepo.findOne({
          where: { emailAddress: loginDto.emailAddress },
        });
      } else if (loginDto.username) {
        user = await this.userRepo.findOne({
          where: {
            username: loginDto.username,
          },
        });
      } else if (loginDto.phoneNumber) {
        user = await this.userRepo.findOne({
          where: { phoneNumber: loginDto.phoneNumber },
        });
      } else {
        throw new BadRequestException('No user identifier provided');
      }
    } catch {
      throw new ServiceUnavailableException('Error fetching user');
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    } else if (user.status !== StatusEnum.ACTIVE) {
      throw new UnauthorizedException('User account is not active');
    }

    const pwdMatch = PasswordHasher.verifyPassword(
      loginDto.password,
      user.passwordHash,
    );

    if (!pwdMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.securityService.signJwt(
      user.emailAddress,
      user.role,
      user.id,
    );

    return {
      token,
      role: user.role,
    };
  }

  async register(registerUserDto: CreateUserDto): Promise<string> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const user = new User();
      user.emailAddress = registerUserDto.emailAddress;

      await queryRunner.manager.save(user);

      const profile = new UserProfile();
      profile.firstName = registerUserDto.firstName;
      profile.lastName = registerUserDto.lastName;
      profile.userId = user.id;

      await queryRunner.manager.save(profile);

      await queryRunner.commitTransaction();

      const otp = await this.securityService.genOtpAsync(
        user.emailAddress,
        IdentifierEnum.EMAIL,
        600, // 10 minutes
      );

      this.mailService.sendVerificationEmail({
        name: profile.fullName,
        emailAddress: user.emailAddress,
        verificationOtp: otp,
      });

      return user.id;
    } catch (e) {
      console.error(e);

      await queryRunner.rollbackTransaction();

      if (HelperService.isQueryFailedError(e)) {
        switch (e.code) {
          case '23505':
            throw new ConflictException('Email address already in use');
          default:
            throw new ServiceUnavailableException('Error creating user');
        }
      }

      throw new InternalServerErrorException('Error creating user');
    } finally {
      await queryRunner.release();
    }
  }

  async resendOtp({
    emailAddress,
    username,
    phoneNumber,
  }: {
    emailAddress?: string;
    username?: string;
    phoneNumber?: string;
  }): Promise<boolean> {
    let user: User | null;
    let identifierType: IdentifierEnum | undefined;

    if (emailAddress) {
      user = await this.userRepo.findOne({
        where: { emailAddress },
        relations: {
          profile: true, // Ensure the profile is loaded to access fullName
        },
      });
      identifierType = IdentifierEnum.EMAIL;
    } else if (username) {
      user = await this.userRepo.findOne({
        where: { username },
        relations: {
          profile: true, // Ensure the profile is loaded to access fullName
        },
      });
      identifierType = IdentifierEnum.USERNAME;
    } else if (phoneNumber) {
      user = await this.userRepo.findOne({
        where: { phoneNumber },
        relations: {
          profile: true, // Ensure the profile is loaded to access fullName
        },
      });
      identifierType = IdentifierEnum.PHONE;
    } else {
      throw new BadRequestException('No user identifier provided');
    }

    if (!user) {
      //   throw new UnauthorizedException('User not found');
      return true;
    }

    const otp = await this.securityService.genOtpAsync(
      user.emailAddress,
      identifierType,
    );

    this.mailService.sendVerificationEmail({
      name: user.profile?.fullName || 'User',
      emailAddress: user.emailAddress,
      verificationOtp: otp,
    });

    return true;
  }

  async forgotPassword({
    emailAddress,
    phoneNumber,
    username,
  }: {
    emailAddress?: string;
    phoneNumber?: string;
    username?: string;
  }): Promise<boolean> {
    let user: User | null;
    let identifierType: IdentifierEnum | undefined;

    if (emailAddress) {
      user = await this.userRepo.findOne({
        where: { emailAddress },
        relations: {
          profile: true, // Ensure the profile is loaded to access fullName
        },
      });
      identifierType = IdentifierEnum.EMAIL;
    } else if (username) {
      user = await this.userRepo.findOne({
        where: { username },
        relations: {
          profile: true, // Ensure the profile is loaded to access fullName
        },
      });
      identifierType = IdentifierEnum.USERNAME;
    } else if (phoneNumber) {
      user = await this.userRepo.findOne({
        where: { phoneNumber },
        relations: {
          profile: true, // Ensure the profile is loaded to access fullName
        },
      });
      identifierType = IdentifierEnum.PHONE;
    } else {
      throw new BadRequestException('No user identifier provided');
    }

    if (!user) {
      // throw new UnauthorizedException('User not found');
      return true;
    }

    const otp = await this.securityService.genOtpAsync(
      user.emailAddress,
      identifierType,
    );

    this.mailService.sendResetPasswordEmail({
      name: user.profile?.fullName || 'User',
      emailAddress: user.emailAddress,
      resetOtp: otp,
    });

    return true;
  }

  async resetPassword({
    emailAddress,
    phoneNumber,
    username,
    otp,
    password,
  }: {
    emailAddress?: string;
    phoneNumber?: string;
    username?: string;
    otp: string;
    password: string;
  }): Promise<boolean> {
    let identifier: string | undefined;
    let identifierType: IdentifierEnum | undefined;
    if (emailAddress) {
      identifier = emailAddress;
      identifierType = IdentifierEnum.EMAIL;
    } else if (username) {
      identifier = username;
      identifierType = IdentifierEnum.USERNAME;
    } else if (phoneNumber) {
      identifier = phoneNumber;
      identifierType = IdentifierEnum.PHONE;
    } else {
      throw new BadRequestException('No user identifier provided');
    }

    const storedOtp = await this.securityService.retrieveOtpAsync(
      identifier,
      identifierType,
    );

    if (storedOtp !== otp) {
      throw new UnauthorizedException('Invalid reset OTP');
    }

    let user: User | null;
    if (emailAddress) {
      user = await this.userRepo.findOne({
        where: { emailAddress },
      });
    } else if (username) {
      user = await this.userRepo.findOne({
        where: { username },
      });
    } else if (phoneNumber) {
      user = await this.userRepo.findOne({
        where: { phoneNumber },
      });
    } else {
      throw new UnauthorizedException('No user identifier provided');
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.password = password; // This will hash the password

    if (user.status !== StatusEnum.ACTIVE) {
      user.status = StatusEnum.ACTIVE; // Activate the user if not already active
      user.dateActivated = new Date(); // Set the activation date
    }
    await this.userRepo.save(user);

    await this.securityService.deleteOtpAsync(identifier, identifierType);

    return true;
  }
}
