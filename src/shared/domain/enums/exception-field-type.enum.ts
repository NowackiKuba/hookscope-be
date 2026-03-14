/**
 * Enum representing the field type used in exception messages.
 * Used by various domain exceptions to specify which field was used to identify an entity.
 */
export enum ExceptionFieldType {
  ID = 'id',
  USER_ID = 'userId',
  EMAIL = 'email',
  STRIPE_ID = 'stripeId',
  COMMAND_ID = 'commandId',
  PROMPT_ID = 'promptId',
}
