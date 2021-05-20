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


@Injectable()
export class AuthService {
    // constructor(@InjectModel('User') private readonly userModel: Model<IUser>){}
    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
        @InjectModel('RefreshTokenSchema') private readonly refreshTokenModel: Model<IJwtRefreshToken>
    ) { }

    async login(userDto: CreateUserDto): Promise<any> {

        let existedUser = null;

        const ishave = await this.usersService.isExist(userDto);
        if (!ishave)
            existedUser = await this.usersService.createUser(userDto).catch(e => console.error(e));
        else
            existedUser = await this.usersService.findByCreateUserDto(userDto).catch(e => console.error(e));

        // TODO какую-то проверку, что пользователь создался/нащелся
        // if(existedUser == null) -- плохо

        const payload: IJwtAccessPayload = {
            id: existedUser._id,
            email: existedUser.email,
        }

        const accessToken = this.jwtService.sign(payload);
        console.log('logining accses token payload ');
        console.log(payload);
        console.log(accessToken);

        const refresh_token = this.randomString(20);
        await this.saveRefreshTokenInDB(existedUser._id, refresh_token);

        // {
        //     "access_token": "eyJz93a...k4laUWw",
        //     "refresh_token": "GEbRxBN...edjnXbL",
        //     "token_type": "Bearer"
        //   }

        // сгенерировать строку -- рефреш токен
        // сохранить его в базу
        // положить в куки?? Set-Cookie: refreshToken='c84f18a2-c6c7-4850-be15-93f9cbaef3b3'; HttpOnly

        return {
            access_token: accessToken,
            refresh_token: refresh_token,
            token_type: "Bearer"
        };
    }

    private randomString(i: number): string {
        let rnd = '';
        while (rnd.length < i) 
            rnd += Math.random().toString(36).substring(2);
        return rnd.substring(0, i);
    };

    private async saveRefreshTokenInDB(userId: string, refreshToken: string): Promise<IJwtRefreshToken> {
        let tokenRecord: JwtRefreshPayloadDto | IJwtRefreshToken = this.createNewRefreshTokenPayload(userId, refreshToken);
        const isExist = await this.refreshTokenModel.exists({userId: userId});
        if (isExist) {
            const tokenFromDB = await this.refreshTokenModel
                .findOne({userId: userId})
                .orFail(new NotFoundException('The refresh token was not found by the user ID.'));

            const updatedToken = await this.refreshTokenModel
                .findByIdAndUpdate(tokenFromDB._id, tokenRecord, { new: true })
                .orFail(new BadRequestException('The refresh token was not updated.'));
                
            tokenRecord = await updatedToken.execPopulate();            
        }
        else {
            const createdToken = new this.refreshTokenModel(tokenRecord);
            tokenRecord = await createdToken.save();
        }
        
        return tokenRecord;
    }

    private createNewRefreshTokenPayload(userId: string, refreshToken: string): JwtRefreshPayloadDto {
        const tokenRecord: JwtRefreshPayloadDto = {} as JwtRefreshPayloadDto;

        tokenRecord.userId = userId;

        tokenRecord.refreshToken = refreshToken;
        tokenRecord.created_at = new Date();

        const count: number = Number.parseInt(process.env.JWT_REFRESH_TOKEN_PERIOD_COUNT);
        const type: string = process.env.JWT_REFRESH_TOKEN_PERIOD_TYPE;
        tokenRecord.expired_at = moment(tokenRecord.created_at).add(count, type as any).toDate();
        
        tokenRecord.updated_at = tokenRecord.created_at;
        
        return tokenRecord;
    }
}