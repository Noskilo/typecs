import { Entity } from "./entity";
import { Component } from "./component";
import { WorldEntityManager } from "./world-entity-manager";
import { QueryDataLoader, QueryOptions } from "./query";
import { System } from "./system";

export class World {
  private entityManager: WorldEntityManager = new WorldEntityManager();
  private queryDataLoader: QueryDataLoader = new QueryDataLoader(
    this.entityManager,
  );

  private systems: System[] = [];

  public query(options: QueryOptions) {
    return this.queryDataLoader.load(options);
  }

  public addSystem(system: (new () => System) | System): World {
    if (system instanceof System) {
      this.systems.push(system);
    } else {
      this.systems.push(new system());
    }

    return this;
  }

  public async execute(): Promise<void> {
    for (const system of this.systems) {
      const queryOptions = system.schema();

      for (const key in queryOptions) {
        system.queries[key] = this.query(queryOptions[key]);
      }

      await system.execute();
      this.entityManager.flush();
    }

    return;
  }

  public createEntity(
    ...components: (Component<any> | (new () => Component<any>))[]
  ): Entity {
    const hasDeadEntities = this.entityManager.deadPool.length > 0;
    const entityId =
      this.entityManager.deadPool.pop() ??
      this.entityManager.stats.entityIdCounter++;

    if (!hasDeadEntities) {
      for (const components of this.entityManager.components) {
        components.push(undefined);
      }
    }

    const entity = new Entity(entityId, this.entityManager);

    for (const component of components) {
      entity.addComponent(component);
    }

    if (this.entityManager.entityPool.length <= entityId) {
      this.entityManager.entityPool[entityId] = entity;
    }

    return entity;
  }
}
