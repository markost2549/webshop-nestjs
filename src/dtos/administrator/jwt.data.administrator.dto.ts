export class JwtDataAdministratorDto {
  adminstratorId: number;
  username: string;
  exp: number;
  ip: string;
  ua: string;

  toPlainObject() {
    return {
      adminstratorId: this.adminstratorId,
      username: this.username,
      exp: this.exp,
      ip: this.ip,
      ua: this.ua,
    };
  }
}
