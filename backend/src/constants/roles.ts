export enum UserRole {
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  CUSTOMER = 'CUSTOMER',
}

export const ROLES = {
  ADMIN: UserRole.ADMIN,
  OPERATOR: UserRole.OPERATOR,
  CUSTOMER: UserRole.CUSTOMER,
} as const;

