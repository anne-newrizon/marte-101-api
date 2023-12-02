import { Metrics } from '../entity/Metrics';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { Metric } from '../../models/enumMetrics';

export class UsersMetrics1700157286032 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.insert(Metrics, {
      metric: Metric.COMPLETED,
      quantity: 1
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(Metrics, {
      metric: Metric.COMPLETED
    });
  }
}