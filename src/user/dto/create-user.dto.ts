export class CreateUserDto {
    constructor(
    readonly email: string,
    readonly emailVerify: boolean,
    readonly familyName: string,
    readonly givenName: string,
    )
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    {}
}