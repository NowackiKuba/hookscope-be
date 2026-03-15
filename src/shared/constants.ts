import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

export const LoggerProvider = WINSTON_MODULE_PROVIDER;
export const HttpClientProvider = Symbol('HttpClient');
