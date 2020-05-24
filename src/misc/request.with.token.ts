import { JwtDataDto } from '../dtos/auth/jwt.data.dto';

declare module 'express' {
    interface Request {
        token: JwtDataDto
    }
}