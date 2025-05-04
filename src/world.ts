import { Entity } from "./entity";
import { Component } from "./component";
import { WorldEntityManager } from "./world-entity-manager";

export class World {
  private entityManager: WorldEntityManager = new WorldEntityManager();

  public execute(): void {
    this.entityManager.flush();
    return;
  }

  public createEntity(
    ...components: (Component | (new () => Component))[]
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
