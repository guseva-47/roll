import { Module } from '@nestjs/common';
import { TrueRandomeModule } from 'src/true-randome/true-randome.module';
import { FormuleService } from './formule.service';
import { FormuleController } from './formule.controller';

@Module({
    imports: [TrueRandomeModule],
    providers: [FormuleService],
    exports: [FormuleService],
    controllers: [FormuleController],
})
export class FormuleModule { }
