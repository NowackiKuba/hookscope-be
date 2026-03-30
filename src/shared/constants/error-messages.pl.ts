/**
 * Polish error messages for non-technical users.
 * Keys are error codes returned by the API (error.code).
 * Use getErrorMessagePl(code) in mappers to return user-facing messages in Polish.
 */
export const ERROR_MESSAGES_PL: Record<string, string> = {
  // Rezerwacje
  ROOM_NOT_AVAILABLE:
    'Wybrany pokój jest niedostępny w podanych datach. Wybierz inne terminy lub inny pokój.',
  RESERVATION_VALIDATION:
    'Nieprawidłowe dane rezerwacji. Sprawdź wpisane informacje i spróbuj ponownie.',
  EMPTY_ROOMS: 'Wybierz co najmniej jeden pokój, aby utworzyć rezerwację.',
  RESERVATION_NOT_FOUND: 'Nie znaleziono rezerwacji.',
  ROOM_NOT_FOUND: 'Nie znaleziono pokoju powiązanego z rezerwacją.',
  ROOM_NOT_AVAILABLE_FOR_PUBLIC_BOOKING:
    'Wybrany pokój nie istnieje lub nie jest dostępny do rezerwacji.',
  ROOMS_ALREADY_RESERVED:
    'Nie można przypisać tych pokoi: w podanym okresie są już zarezerwowane. Wybierz inne pokoje lub terminy.',
  RESERVATION_PERSISTENCE:
    'Wystąpił błąd podczas zapisywania rezerwacji. Spróbuj ponownie za chwilę.',

  // Klienci
  CUSTOMER_ALREADY_EXISTS:
    'Klient z podanym adresem e-mail już istnieje.',
  CUSTOMER_VALIDATION:
    'Nieprawidłowe dane klienta. Sprawdź wpisane informacje i spróbuj ponownie.',
  CUSTOMER_NOT_FOUND: 'Nie znaleziono klienta.',
  CUSTOMER_PERSISTENCE:
    'Wystąpił błąd podczas zapisywania klienta. Spróbuj ponownie za chwilę.',

  // Faktury
  INVOICE_VALIDATION:
    'Nieprawidłowe dane faktury. Sprawdź wpisane informacje i spróbuj ponownie.',
  INVOICE_NOT_FOUND: 'Nie znaleziono faktury.',
  INVOICE_PERSISTENCE:
    'Wystąpił błąd podczas zapisywania faktury. Spróbuj ponownie za chwilę.',

  // Płatności
  PAYMENT_VALIDATION:
    'Nieprawidłowe dane płatności. Sprawdź wpisane informacje i spróbuj ponownie.',
  PAYMENT_NOT_FOUND: 'Nie znaleziono płatności.',
  PAYMENT_PERSISTENCE:
    'Wystąpił błąd podczas zapisywania płatności. Spróbuj ponownie za chwilę.',

  // Auth / użytkownik
  MISSING_TOKEN: 'Zaloguj się, aby kontynuować.',
  INVALID_TOKEN: 'Sesja wygasła lub link jest nieprawidłowy. Zaloguj się ponownie.',
  USER_NOT_FOUND: 'Nie znaleziono użytkownika.',
  SESSION_EXPIRED: 'Sesja wygasła. Zaloguj się ponownie.',
  INSUFFICIENT_TOKENS: 'Niewystarczająca liczba tokenów do wykonania tej operacji.',
  USERNAME_ALREADY_EXISTS: 'Ta nazwa użytkownika jest już zajęta.',

  ENDPOINT_NOT_FOUND: 'Nie znaleziono endpointu.',
  ENDPOINT_DIRECTORY_NOT_FOUND: 'Nie znaleziono folderu endpointów.',
  ENDPOINT_LATEST_SCHEMA_NOT_FOUND:
    'Nie znaleziono zapisanego schematu dla tego typu zdarzenia. Najpierw zarejestruj webhook lub schemat.',
  USER_SETTINGS_NOT_FOUND: 'Nie znaleziono ustawień użytkownika.',
  REQUEST_NOT_FOUND: 'Nie znaleziono żądania.',
  WEBHOOK_ALERT_NOT_FOUND: 'Nie znaleziono alertu webhook.',
  UNKNOWN_WEBHOOK_PROVIDER: 'Nieobsługiwany dostawca webhooków.',

  WAITLIST_ALREADY_EXISTS: 'Ten adres e-mail jest już zapisany na listę oczekujących.',
  WAITLIST_VALIDATION: 'Nieprawidłowe dane. Sprawdź adres e-mail i spróbuj ponownie.',

  // Ogólne HTTP (używane przez HttpExceptionFilter)
  VALIDATION_ERROR: 'Sprawdź poprawność wypełnionych pól i spróbuj ponownie.',
  UNAUTHORIZED: 'Zaloguj się, aby kontynuować.',
  FORBIDDEN: 'Nie masz uprawnień do tej operacji.',
  NOT_FOUND: 'Nie znaleziono żądanego zasobu.',
  METHOD_NOT_ALLOWED: 'Ta operacja nie jest dozwolona.',
  CONFLICT: 'Operacja nie może zostać wykonana z powodu konfliktu danych.',
  UNPROCESSABLE_ENTITY: 'Wysłane dane są nieprawidłowe.',
  TOO_MANY_REQUESTS: 'Zbyt wiele prób. Poczekaj chwilę i spróbuj ponownie.',
  INTERNAL_SERVER_ERROR:
    'Wystąpił błąd po naszej stronie. Spróbuj ponownie za chwilę.',
  HTTP_ERROR: 'Wystąpił błąd. Spróbuj ponownie.',
};

/**
 * Returns Polish user-facing message for an error code.
 * Falls back to defaultMessage or generic message if code is unknown.
 */
export function getErrorMessagePl(
  code: string,
  defaultMessage?: string,
): string {
  const msg = ERROR_MESSAGES_PL[code];
  if (msg) return msg;
  return defaultMessage ?? ERROR_MESSAGES_PL.INTERNAL_SERVER_ERROR ?? 'Wystąpił błąd. Spróbuj ponownie.';
}
