import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Log } from './entities/log.entity';
import { LogService } from './log.service';

@Module({
  imports: [TypeOrmModule.forFeature([Log])],
  providers: [LogService],
  exports: [LogService],
})
export class LogsModule {}
