import { Module } from '@nestjs/common';
import { TrueRandomeModule } from 'src/true-randome/true-randome.module';
import { FormulaService } from './formula.service';
import { FormulaController } from './formula.controller';

@Module({
    imports: [TrueRandomeModule],
    providers: [FormulaService],
    exports: [FormulaService],
    controllers: [FormulaController],
})
export class FormulaModule {}
