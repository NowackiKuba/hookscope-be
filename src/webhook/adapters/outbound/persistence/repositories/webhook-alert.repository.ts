import {
  EntityManager,
  EntityRepository,
  FilterQuery,
} from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import {
  WebhookAlertFilters,
  WebhookAlertRepositoryPort,
} from '@webhook/domain/ports/outbound/persistence/repositories/webhook-alert.repository.port';
import { WebhookAlertEntity } from '../entities/webhook-alert.entity';
import { WebhookAlertMapper } from '../mappers/webhook-alert.mapper';
import { WebhookAlert } from '@webhook/domain/aggreagates/webhook-alert';
import { WebhookAlertId } from '@webhook/domain/value-objects/webhook-alert-id.vo';
import { Page, paginate } from '@shared/utils/pagination';

const DEFAULT_ORDER_FIELD = 'createdAt';
const DEFAULT_ORDER_DIRECTION: 'asc' | 'desc' = 'desc';
const ALLOWED_ORDER_FIELDS = new Set([
  'createdAt',
  'updatedAt',
  'type',
  'status',
]);

@Injectable()
export class WebhookAlertRepository implements WebhookAlertRepositoryPort {
  private readonly dbSource: EntityRepository<WebhookAlertEntity>;

  constructor(
    private readonly em: EntityManager,
    private readonly mapper: WebhookAlertMapper,
  ) {
    this.dbSource = this.em.getRepository(WebhookAlertEntity);
  }

  async create(webhookAlert: WebhookAlert): Promise<WebhookAlert> {
    const res = this.dbSource.create(this.mapper.toEntity(webhookAlert));

    this.em.persist(res);

    await this.em.flush();

    return this.mapper.toDomain(res);
  }

  async delete(id: WebhookAlertId): Promise<void> {
    await this.dbSource.nativeDelete({ id: id.value });
  }

  async getByEndpointId(
    filters: WebhookAlertFilters,
    id: string,
  ): Promise<Page<WebhookAlert>> {
    const where: FilterQuery<WebhookAlertEntity> = {
      endpoint: {
        id,
      },
    };

    const { limit, offset, orderBy, orderByField, status, type } = filters;

    if (status) {
      where.status = status.value;
    }

    if (type) {
      where.type = type.value;
    }

    return await this.getPaginated(where, {
      limit,
      offset,
      orderBy,
      orderByField,
    });
  }

  async getByUserId(
    filters: WebhookAlertFilters,
    id: string,
  ): Promise<Page<WebhookAlert>> {
    const where: FilterQuery<WebhookAlertEntity> = {
      user: {
        id,
      },
    };

    const { limit, offset, orderBy, orderByField, status, type } = filters;

    if (status) {
      where.status = status.value;
    }

    if (type) {
      where.type = type.value;
    }

    return await this.getPaginated(where, {
      limit,
      offset,
      orderBy,
      orderByField,
    });
  }

  async getById(id: WebhookAlertId): Promise<WebhookAlert | null> {
    const alert = await this.dbSource.findOne({ id: id.value });

    return alert ? this.mapper.toDomain(alert) : null;
  }

  async update(webhookAlert: WebhookAlert): Promise<void> {
    await this.dbSource.nativeUpdate(
      { id: webhookAlert.id.value },
      this.mapper.toEntity(webhookAlert),
    );
  }

  async getLatestByEndpointAndType(
    endpointId: string,
    type: string,
  ): Promise<WebhookAlert | null> {
    const alert = await this.dbSource.findOne(
      {
        endpoint: { id: endpointId },
        type,
      },
      {
        orderBy: { createdAt: 'desc' },
      },
    );

    return alert ? this.mapper.toDomain(alert) : null;
  }

  async getActiveByEndpointAndType(
    endpointId: string,
    type: string,
  ): Promise<WebhookAlert | null> {
    const alert = await this.dbSource.findOne(
      {
        endpoint: { id: endpointId },
        type,
        scannerStatus: 'active',
      },
      {
        orderBy: { createdAt: 'desc' },
      },
    );

    return alert ? this.mapper.toDomain(alert) : null;
  }

  private async getPaginated(
    where: FilterQuery<WebhookAlertEntity>,
    page: {
      limit?: number;
      offset?: number;
      orderBy?: 'asc' | 'desc';
      orderByField?: string;
    },
  ): Promise<Page<WebhookAlert>> {
    const rawField = page.orderByField ?? DEFAULT_ORDER_FIELD;
    const orderByField = ALLOWED_ORDER_FIELDS.has(rawField)
      ? rawField
      : DEFAULT_ORDER_FIELD;
    const orderBy = page.orderBy ?? DEFAULT_ORDER_DIRECTION;

    const [alerts, totalCount] = await this.dbSource.findAndCount(where, {
      limit: page.limit,
      offset: page.offset,
      orderBy: {
        [orderByField]: orderBy,
      },
    });

    return paginate(
      alerts.map((alert) => this.mapper.toDomain(alert)),
      { limit: page.limit, offset: page.offset, totalCount },
    );
  }
}
