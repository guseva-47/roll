import { IsNotEmpty } from "class-validator";

export class JwtRefreshPayloadDto {
    @IsNotEmpty()
    userId: string;
    @IsNotEmpty()
    refreshToken: string;
    @IsNotEmpty()
    expired_at: Date; // когда истекает
    @IsNotEmpty()
    created_at: Date; // когда был создан
    @IsNotEmpty()
    updated_at: Date; // когда обновлен
    tokenRecord: any;
}