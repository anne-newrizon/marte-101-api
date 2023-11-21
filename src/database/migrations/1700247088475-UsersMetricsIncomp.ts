import { Metrics } from '../entity/UserMetric';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class UsersMetricsIncomp1700247088475 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.insert(Metrics, {
      metric: 'Registrations Incompleted',
      quantity: 0
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager.delete(Metrics, {
      metric: 'Registrations Incompleted',
      quantity: 0
    });
  }
}
