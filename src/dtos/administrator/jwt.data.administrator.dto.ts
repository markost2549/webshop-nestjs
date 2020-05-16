export class JwtDataAdministratorDto {
  adminstratorId: number;
  username: string;
  ext: number;
  ip: string;
  ua: string;

  toPlainObject() {
    return {
      adminstratorId: this.adminstratorId,
      username: this.username,
      ext: this.ext,
      ip: this.ip,
      ua: this.ua,
    };
  }
}
