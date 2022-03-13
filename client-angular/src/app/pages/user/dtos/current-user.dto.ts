interface currentUserDataDto {
  discordId: string;
  did: string,
  type: string,
  name: string,
  email: string,
  canManageAdmins: boolean,
  active: boolean
}

export default interface CurrentUserDto {
  code: number,
  message: string,
  data: currentUserDataDto
}
