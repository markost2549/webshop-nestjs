export class LoginInfoDto {
  id: number;
  username: string;
  token: string;

  constructor(id: number, username: string, jwt: string) {
    this.id = id;
    this.username = username;
    this.token = jwt;
  }
}
