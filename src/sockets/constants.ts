import { CLI_SOCKETS_SERVICE } from '@sockets/domain/ports/outbound/services/cli-sockets.service.port';

export const Token = {
  SocketsService: Symbol('SocketsService'),
  CliSocketsService: CLI_SOCKETS_SERVICE,
};
