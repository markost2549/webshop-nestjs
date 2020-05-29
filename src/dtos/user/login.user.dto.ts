import * as Validator from 'class-validator';
export class LoginUserDto {
    @Validator.IsNotEmpty()
    @Validator.IsEmail({
        // eslint-disable-next-line @typescript-eslint/camelcase
        allow_utf8_local_part: true,
    })
    email: string;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(6, 128)
    password: string;
}