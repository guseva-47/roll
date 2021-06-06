import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NoteService } from './note.service';
import { NoteSchema } from './schema/note.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Note', schema: NoteSchema }])],
    providers: [NoteService],
    exports: [NoteService],
})
export class NoteModule {}
