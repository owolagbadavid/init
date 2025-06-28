import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { randomBytes, pbkdf2Sync, timingSafeEqual } from 'crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  CACHE_DEFAULT_TTL_MILLISECONDS,
  JWT_DEFAULT_AUDIENCE,
  JWT_DEFAULT_EXPIRATION_SECONDS,
  JWT_DEFAULT_ISSUER,
  JWT_DEFAULT_SECRET,
} from 'src/constants';
import { ISecurityService } from './isecurity.service';
import { IdentifierEnum } from 'src/models/enums/identifier.enum';
import { UserContextDto } from 'src/models/user/user.dto';

const SALT_SIZE = 16; // 128-bit
const KEY_SIZE = 32; // 256-bit
const ITERATIONS = 10000;

export class PasswordHasher {
  static hashPassword(password: string): string {
    const salt = randomBytes(SALT_SIZE);
    const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_SIZE, 'sha256');

    const hashBytes = Buffer.concat([salt, hash]);
    return hashBytes.toString('base64');
  }

  static verifyPassword(password: string, hashedPassword: string): boolean {
    const hashBytes = Buffer.from(hashedPassword, 'base64');
    const salt = hashBytes.subarray(0, SALT_SIZE);
    const storedHash = hashBytes.subarray(SALT_SIZE);

    const computedHash = pbkdf2Sync(
      password,
      salt,
      ITERATIONS,
      KEY_SIZE,
      'sha256',
    );

    return timingSafeEqual(computedHash, storedHash);
  }
}

@Injectable()
export class SecurityService implements ISecurityService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  private get jwtConfig() {
    return {
      secret:
        this.configService.get<string>('JWT_SECRET') ?? JWT_DEFAULT_SECRET,
      issuer:
        this.configService.get<string>('JWT_ISSUER') || JWT_DEFAULT_ISSUER,
      audience:
        this.configService.get<string>('JWT_AUDIENCE') || JWT_DEFAULT_AUDIENCE,
      expiryInSeconds: parseInt(
        this.configService.get<string>('JWT_EXPIRY_SECONDS') ||
          `${JWT_DEFAULT_EXPIRATION_SECONDS}`,
        10,
      ),
    };
  }

  async genOtpAsync(
    identifier: string,
    identifierType: IdentifierEnum,
    expiry: number = CACHE_DEFAULT_TTL_MILLISECONDS,
  ): Promise<string> {
    let otp: string;
    if (this.configService.get('NODE_ENV') === 'production') {
      otp = Math.floor(100000 + Math.random() * 900000).toString();
    }

    otp ??= '123456';

    const key = `otp:${identifier}:${identifierType}`;
    await this.cacheManager.set(key, otp, expiry);
    return otp;
  }

  async retrieveOtpAsync(
    identifier: string,
    identifierType: IdentifierEnum,
  ): Promise<string | undefined> {
    const key = `otp:${identifier}:${identifierType}`;
    return await this.cacheManager.get<string>(key);
  }

  async deleteOtpAsync(
    identifier: string,
    identifierType: IdentifierEnum,
  ): Promise<void> {
    const key = `otp:${identifier}:${identifierType}`;
    await this.cacheManager.del(key);
  }

  signJwt(email: string, role: string, userId: string): string {
    const payload: UserContextDto = {
      emailAddress: email,
      role,
      sub: userId,
      jti: crypto.randomUUID(),
    };

    return this.jwtService.sign(payload, {
      secret: this.jwtConfig.secret,
      issuer: this.jwtConfig.issuer,
      audience: this.jwtConfig.audience,
      expiresIn: this.jwtConfig.expiryInSeconds,
      algorithm: 'HS256',
    });
  }

  verifyJwt(token: string): UserContextDto {
    try {
      return this.jwtService.verify<UserContextDto>(token, {
        secret: this.jwtConfig.secret,
        algorithms: ['HS256'],
        audience: this.jwtConfig.audience,
        issuer: this.jwtConfig.issuer,
        ignoreExpiration: false,
      });
    } catch {
      throw new Error('Invalid JWT token');
    }
  }
}
