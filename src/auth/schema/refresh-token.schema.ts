import * as mongoose from 'mongoose';
export const RefreshTokenSchema = new mongoose.Schema({ 
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    refreshToken: {type: String, required: true},
    expired_at: {type: Date, required: true}, // когда истекает
    created_at: {type: Date, required: true}, // когда был создан
    updated_at: {type: Date, required: true} // когда был обновлен 
});