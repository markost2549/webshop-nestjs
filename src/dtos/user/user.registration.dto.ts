import * as Validator from 'class-validator';
export class UserRegistrationDto {
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

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(2, 64)
    firstname: string;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(2, 64)
    lastname: string;

    @Validator.IsNotEmpty()
    @Validator.IsPhoneNumber(null)
    phoneNumber: string;

    @Validator.IsNotEmpty()
    @Validator.IsString()
    @Validator.Length(10, 512)
    postalAddress: string;

}