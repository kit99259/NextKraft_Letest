export enum UserRole {
  ADMIN = 'admin',
  OPERATOR = 'operator',
  CUSTOMER = 'customer',
}

export const ROLES = {
  ADMIN: UserRole.ADMIN,
  OPERATOR: UserRole.OPERATOR,
  CUSTOMER: UserRole.CUSTOMER,
} as const;

