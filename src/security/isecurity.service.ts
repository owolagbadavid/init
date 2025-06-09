import { IdentifierEnum } from 'src/models/enums/identifier.enum';

export interface ISecurityService {
  genOtpAsync(
    identifier: string,
    identifierType: IdentifierEnum,
    expiry?: number,
  ): Promise<string>;

  retrieveOtpAsync(
    identifier: string,
    identifierType: IdentifierEnum,
  ): Promise<string | undefined>;

  deleteOtpAsync(
    identifier: string,
    identifierType: IdentifierEnum,
  ): Promise<void>;

  signJwt(email: string, role: string, userId: string): string;
}
