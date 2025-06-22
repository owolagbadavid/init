import { ConfigService } from '@nestjs/config';
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CloudStorageService {
  private blobServiceClient: BlobServiceClient;
  private readonly AZURE_STORAGE_CONNECTION_STRING?: string;
  private readonly AZURE_STORAGE_ACCOUNT?: string;
  private readonly AZURE_STORAGE_KEY?: string;
  private readonly AZURE_DEFAULT_CONTAINER?: string;

  constructor(private configService: ConfigService) {
    this.AZURE_STORAGE_CONNECTION_STRING = configService.get<string>(
      'AZURE_STORAGE_CONNECTION_STRING',
    );
    this.AZURE_STORAGE_ACCOUNT = configService.get<string>(
      'AZURE_STORAGE_ACCOUNT',
    );
    this.AZURE_STORAGE_KEY = configService.get<string>('AZURE_STORAGE_KEY');

    this.AZURE_DEFAULT_CONTAINER = configService.get<string>(
      'AZURE_DEFAULT_CONTAINER',
    );

    if (!this.AZURE_STORAGE_CONNECTION_STRING) {
      throw new Error('Azure Storage connection string is not set');
    }
    if (!this.AZURE_STORAGE_ACCOUNT || !this.AZURE_STORAGE_KEY) {
      throw new Error(
        'Azure Storage account and key must be set if connection string is not provided',
      );
    }
    if (!this.AZURE_DEFAULT_CONTAINER) {
      throw new Error('Azure default container is not set');
    }
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      this.AZURE_STORAGE_CONNECTION_STRING,
    );
  }

  async uploadBlob(
    blobName: string,
    content: Express.Multer.File,
    containerName: string = this.AZURE_DEFAULT_CONTAINER!,
  ): Promise<string> {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    await containerClient.createIfNotExists();

    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const response = await blockBlobClient.upload(content.buffer, content.size);

    if (response.errorCode) {
      throw new Error(`Failed to upload blob: ${response.errorCode}`);
    }

    return blockBlobClient.url;
  }

  generateBlobSasUrl(
    blobName: string,
    containerName: string = this.AZURE_DEFAULT_CONTAINER!,
    expiresInMinutes: number = 60,
  ): string {
    const containerClient =
      this.blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const sharedKeyCredential = new StorageSharedKeyCredential(
      this.AZURE_STORAGE_ACCOUNT!,
      this.AZURE_STORAGE_KEY!,
    );

    const permissions = new BlobSASPermissions();
    permissions.read = true;
    permissions.write = true;
    permissions.create = true;

    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + expiresInMinutes);

    const sasToken = generateBlobSASQueryParameters(
      {
        containerName,
        blobName,
        permissions,
        expiresOn: expiryDate,
      },
      sharedKeyCredential,
    ).toString();

    return `${blockBlobClient.url}?${sasToken}`;
  }

  // Overload signatures
  async deleteBlob(blobUrl: string): Promise<void>;
  async deleteBlob(containerName: string, blobName: string): Promise<void>;

  // Implementation
  async deleteBlob(arg1: string, arg2?: string): Promise<void> {
    if (arg2 === undefined) {
      // Handle blobUrl case
      const url = new URL(arg1);
      const pathParts = url.pathname.split('/');
      const containerName = pathParts[1];
      const blobName = pathParts.slice(2).join('/');

      const containerClient =
        this.blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.deleteIfExists();
    } else {
      arg1 = arg1.trim() === '' ? this.AZURE_DEFAULT_CONTAINER! : arg1.trim();
      // Handle containerName + blobName case
      const containerClient = this.blobServiceClient.getContainerClient(arg1);
      const blockBlobClient = containerClient.getBlockBlobClient(arg2);
      await blockBlobClient.deleteIfExists();
    }
  }
}
