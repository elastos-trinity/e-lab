export type User = {
  did: string;
  name?: string; // User name, from his DID profile
  email?: string; // User email, from his DID profile
  type: 'admin' | 'user';
  //key: string; // What is this? Is this optional? Some DB insert don't set this.
  active?: boolean; // Whether this user is active, meaning "confirmed" - telegram verified)
  tgName?: string; // TODO: use telegram UID (constant), not "name" (can be changed)
  code?: string; // TODO: what code is this?
  creationTime?: number;
}
