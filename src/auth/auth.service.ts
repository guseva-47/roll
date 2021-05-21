import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import moment from 'moment';

import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { IJwtAccessPayload } from './interface/jwt-access-payload.interfase';
import { IJwtRefreshToken } from './interface/jwt-refresh-payload.interfase'
import { JwtRefreshPayloadDto} from './dto/jwt-refresh-payload.dto'
import { ITokenObject } from './interface/tokens-object.interface';
import { InvalidRefreshToken } from './exception/invalid-refresh-token.exception';


@Injectable()
export class AuthService {
    // constructor(@InjectModel('User') private readonly userModel: Model<IUser>){}
    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
        @InjectModel('RefreshTokenSchema') private readonly refreshTokenModel: Model<IJwtRefreshToken>
    ) { }

    async login(userDto: CreateUserDto): Promise<ITokenObject> {

        let existedUser = null;

        const ishave = await this.usersService.isExist(userDto);
        if (!ishave)
            existedUser = await this.usersService.createUser(userDto).catch(e => console.error(e));
        else
            existedUser = await this.usersService.findByCreateUserDto(userDto).catch(e => console.error(e));

        // TODO какую-то проверку, что пользователь создался/нащелся
        // if(existedUser == null) -- плохо

        const payload: ITokenObject = {
            access_token: this.getNewAccessToken(existedUser._id),
            refresh_token: this.getNewRefreshToken(),
            token_type: 'Bearer'
        }

        await this.saveNewRefreshTokenInDB(existedUser._id, payload.refresh_token);

        console.log('logining token payload ');
        console.log(payload);

        return payload;
    };

    async refresh(refreshToken: string): Promise<ITokenObject> {
        const newRefreshTokenRecord = await this.updateRefreshTokenInDB(refreshToken);
        const result: ITokenObject = {
            refresh_token: newRefreshTokenRecord.refreshToken,
            access_token: this.getNewAccessToken(newRefreshTokenRecord.userId),
            token_type: 'Bearer'
        }
        return result;
    };

    private async updateRefreshTokenInDB(refreshToken: string): Promise<IJwtRefreshToken> {
        // получить запись о токене, удалив его из базы
        const tokenRecordFromDB: IJwtRefreshToken = await this.refreshTokenModel
            .findOneAndDelete({ refreshToken: refreshToken })
            .orFail(new InvalidRefreshToken())
            .exec();
        console.log('1 old token was gotten; checking if expired')
        
        // проверить, что время токена Истекло
        const isExpired = tokenRecordFromDB.expired_at.getTime() < new Date().getTime();
        if (isExpired) throw new InvalidRefreshToken();
        console.log('2 token is not expired; saving of a new token')
        
        // записать в базу обновленный токен
        const newTokenRecord = new JwtRefreshPayloadDto();

        newTokenRecord.updated_at = new Date();
        newTokenRecord.expired_at = this.getExpiredTime(newTokenRecord.updated_at);
        newTokenRecord.refreshToken = this.getNewRefreshToken();
        
        newTokenRecord.created_at = tokenRecordFromDB.created_at;
        newTokenRecord.userId = tokenRecordFromDB.userId;

        return new this.refreshTokenModel(newTokenRecord).save();
    };

    private randomString(i: number): string {
        let rnd = '';
        while (rnd.length < i) 
            rnd += Math.random().toString(36).substring(2);
        return rnd.substring(0, i);
    };

    private async saveNewRefreshTokenInDB(userId: string, refreshToken: string): Promise<IJwtRefreshToken> {

        const tokenRecord: JwtRefreshPayloadDto = this.createNewRefreshTokenPayload(userId, refreshToken);
        const isExist = await this.refreshTokenModel.exists({userId: userId});

        if (isExist) {
            const tokenFromDB = await this.refreshTokenModel
                .findOne({userId: userId})
                .orFail(new NotFoundException('The refresh token was not found by the user ID.'));

            const updatedToken = await this.refreshTokenModel
                .findByIdAndUpdate(tokenFromDB._id, tokenRecord, { new: true })
                .orFail(new BadRequestException('The refresh token was not updated.'));

            return await updatedToken.execPopulate();            
        }

        const createdToken = new this.refreshTokenModel(tokenRecord);
        return await createdToken.save();
    };

    private createNewRefreshTokenPayload(userId: string, refreshToken: string): JwtRefreshPayloadDto {
        const tokenRecord: JwtRefreshPayloadDto = new JwtRefreshPayloadDto();

        tokenRecord.userId = userId;

        tokenRecord.refreshToken = refreshToken;

        tokenRecord.created_at = new Date();
        tokenRecord.expired_at = this.getExpiredTime(tokenRecord.created_at);
        tokenRecord.updated_at = tokenRecord.created_at;
        
        return tokenRecord;
    };

    private getExpiredTime(start_date: Date): Date {
        const count: number = Number.parseInt(process.env.JWT_REFRESH_TOKEN_PERIOD_COUNT);
        const type: string = process.env.JWT_REFRESH_TOKEN_PERIOD_TYPE;
        const expiredAt = moment(start_date).add(count, type as any).toDate();
        return expiredAt;
    };

    private getNewRefreshToken(): string {
        return this.randomString(20);
    };

    private getNewAccessToken(userId: string): string {
        const payload: IJwtAccessPayload = {
            id: userId,
            email: '' // TODO: убрать имейлы
        }

        return this.jwtService.sign(payload);
    };
}