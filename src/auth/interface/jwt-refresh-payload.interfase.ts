import { Document } from 'mongoose';

export interface IJwtRefreshToken extends Document {
    readonly userId: string,
    readonly refreshToken: string,
    readonly expired_at: Date, // когда истекает
    readonly created_at: Date, // когда был создан
    readonly updated_at: Date // когда обновлен
  }
  