import { Component } from "./component";
import { Entity } from "./entity";

import { WorldEntityManager } from "./world-entity-manager";

type TypeofComponent = typeof Component<any>;

export type QueryOptions =
  | {
      include: TypeofComponent[];
      exclude: TypeofComponent[];
    }
  | {
      include: TypeofComponent[];
      exclude?: TypeofComponent[];
    }
  | {
      include?: TypeofComponent[];
      exclude: TypeofComponent[];
    };

export class QueryDataLoader {
  constructor(private readonly entityManager: WorldEntityManager) {}

  private getComponentIndices(components: TypeofComponent[]): number[] {
    const componentIndices: number[] = [];
    for (const component of components) {
      const componentIndex = this.entityManager.componentListIndexMap.get(
        component.name,
      );

      if (componentIndex !== undefined) {
        componentIndices.push(componentIndex);
      }
    }

    return componentIndices;
  }

  load(options: QueryOptions) {
    const includeComponentIndices: number[] = this.getComponentIndices(
      options.include ?? [],
    );
    const excludeComponentIndices: number[] = this.getComponentIndices(
      options.exclude ?? [],
    );

    const entities: Entity[] = [];

    for (
      let entityId = 0;
      entityId < this.entityManager.components[0].length;
      entityId++
    ) {
      const isMatch =
        includeComponentIndices.every(
          (index) =>
            this.entityManager.components[index][entityId] !== undefined,
        ) &&
        excludeComponentIndices.every(
          (index) =>
            this.entityManager.components[index][entityId] === undefined,
        );

      if (isMatch) {
        const entity = this.entityManager["entityPool"][entityId];
        entity.reset();
        entities.push(this.entityManager["entityPool"][entityId]);
      }
    }

    return entities;
  }
}
