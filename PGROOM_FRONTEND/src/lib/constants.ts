export const DEFAULT_USER_TYPE = "tenant" as const;
export const MIN_PASSWORD_LENGTH = 6;
export const MIN_NAME_LENGTH = 2;
export const MIN_ADDRESS_LENGTH = 5;
export const MIN_MOBILE_LENGTH = 10;

export const USER_TYPES = {
  TENANT: "tenant",
  OWNER: "owner",
} as const;

export type UserType = typeof USER_TYPES[keyof typeof USER_TYPES]; 