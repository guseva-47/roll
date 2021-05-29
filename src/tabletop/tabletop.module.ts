import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TabletopSchema } from './schema/tabletop.schema';
import { TabletopService } from './tabletop.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Tabletop', schema: TabletopSchema }])],
    providers: [TabletopService],
    exports: [TabletopService],
})
export class TabletopModule {}
