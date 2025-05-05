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
  private systemsToInitialize: System[] = [];

  public terminate() {
    for (const system of this.systems) {
      system.finalize();
    }
    this.entityManager.componentListIndexMap.clear();
  }

  public query(options: QueryOptions) {
    return this.queryDataLoader.load(options);
  }

  public addSystem(system: (new () => System) | System): World {
    if (system instanceof System) {
      this.systemsToInitialize.unshift(system);
    } else {
      this.systemsToInitialize.unshift(new system());
    }

    return this;
  }

  public async execute(lastTime?: number, deltaTime?: number): Promise<void> {
    while (this.systemsToInitialize.length > 0) {
      const system = this.systemsToInitialize.pop();
      if (!system) {
        break;
      }
      system.world = this;
      await system.initialize();
      this.systems.push(system);
    }

    for (const system of this.systems) {
      const queryOptions = system.schema();

      for (const key in queryOptions) {
        system.queries[key] = this.query(queryOptions[key]);
      }

      system.deltaTime = deltaTime ?? 1;
      system.lastTime = lastTime ?? 1;
      await system.execute();
    }
    this.entityManager.flush();
    return;
  }

  public createEntity(...components: Component<any>[]): Entity {
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
