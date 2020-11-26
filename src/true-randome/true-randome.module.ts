import { HttpModule, Module } from '@nestjs/common';
import { TrueRandomeService } from './true-randome.service';

@Module({
    imports: [
        HttpModule.register({
          timeout: 5000,
          maxRedirects: 5,
        }),
    ],
    providers: [TrueRandomeService],
    exports: [TrueRandomeService],
})
export class TrueRandomeModule { }
