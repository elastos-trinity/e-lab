export type UserType = 'admin' | 'user';

export type User = {
  did: string;
  name?: string; // User name, from his DID profile
  email?: string; // User email, from his DID profile
  type: UserType;
  //key: string; // What is this? Is this optional? Some DB insert don't set this.
  active?: boolean; // Whether this user is active, meaning "confirmed" - telegram verified)
  telegramUserName?: string; // Telegram user name, purely informative as this can change.
  telegramUserId?: string; // Telegram user ID (not username)
  telegramVerificationCode?: string;
  kycIdentityHash?: string; // MD5 hash of a specific string representing the unique KYC-ed identity of a user
  creationTime?: number;
  canManageAdmins?: boolean; // Whether this user is allowed to add/remove other admins
  wallets?: string[]; // List of bound wallet addresses
}
