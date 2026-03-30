import { DomainException } from '@shared/domain/exceptions';

export class EndpointDirectoryNotFoundException extends DomainException {
  constructor(directoryId?: string) {
    const message = directoryId
      ? `Endpoint directory with ID ${directoryId} not found`
      : 'Endpoint directory not found';
    super(
      message,
      'ENDPOINT_DIRECTORY_NOT_FOUND',
      directoryId ? { directoryId } : undefined,
    );
  }
}
