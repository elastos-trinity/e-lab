export type User = {
  id: string; // ? Difference with did?
  did: string;
  type: 'admin' | 'user';
  key: string; // What is this? Is this optional? Some DB insert don't set this.
  activate: boolean; // ?
  tgName: string; // TODO: use telegram UID (constant), not "name" (can be changed)
  code: string; // TODO: what code is this?
  createTime: number;
}
