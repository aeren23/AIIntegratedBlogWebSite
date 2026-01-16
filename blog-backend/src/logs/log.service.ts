import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './entities/log.entity';
import { LogAction } from '../common/enums/log-action.enum';

export interface CreateLogDto {
  userId?: string;
  action: LogAction;
  entityType: string;
  entityId: string;
  description?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  async createLog(dto: CreateLogDto): Promise<Log> {
    const log = this.logRepository.create(dto);
    return this.logRepository.save(log);
  }
}
