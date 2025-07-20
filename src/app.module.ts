import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SecurityModule } from './security/security.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule, CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { MailModule } from './mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/data-source';
import { JwtModule } from '@nestjs/jwt';
import { DesktopsModule } from './desktops/desktops.module';
import { FilesModule } from './files/files.module';

const cacheConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return {
      stores: [
        createKeyv({
          url: `redis://${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
          password: configService.get('REDIS_PASSWORD'),
          username: configService.get('REDIS_USERNAME'),
          options: {
            socket: {
              tls: configService.get('REDIS_TLS') === 'true' ? true : undefined,
            },
          },
        }),
      ],
    };
  },
};

@Module({
  imports: [
    AuthModule,
    UsersModule,
    SecurityModule,
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.registerAsync(cacheConfig),
    TypeOrmModule.forRoot(dataSourceOptions),
    JwtModule.register({
      global: true,
    }),
    MailModule,
    DesktopsModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
