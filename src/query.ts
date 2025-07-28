import { Component } from "./component";
import { Entity } from "./entity";

import { WorldEntityManager } from "./world-entity-manager";

type TypeofComponent = typeof Component<any>;

export enum QueryOptionType {
  CURRENT = "current",
  REMOVED = "removed",
}

export type QueryOptions =
  | {
      type?: QueryOptionType;
      include: TypeofComponent[];
      exclude: TypeofComponent[];
    }
  | {
      type?: QueryOptionType;
      include: TypeofComponent[];
      exclude?: TypeofComponent[];
    }
  | {
      type?: QueryOptionType;
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
      } else {
        componentIndices.push(-1);
      }
    }

    return componentIndices;
  }

  load(options: QueryOptions) {
    if (this.entityManager.components.length === 0) {
      return [];
    }

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
      let isMatch = false;

      if (
        options.type === QueryOptionType.CURRENT ||
        options.type === undefined
      ) {
        isMatch =
          includeComponentIndices.every(
            (index) =>
              index !== -1 &&
              this.entityManager.components[index][entityId] !== undefined &&
              this.entityManager.components[index][entityId]?.removed_at ===
                undefined,
          ) &&
          excludeComponentIndices.every(
            (index) =>
              index === -1 ||
              this.entityManager.components[index][entityId] === undefined ||
              this.entityManager.components[index][entityId]?.removed_at !==
                undefined,
          );
      } else if (options.type === QueryOptionType.REMOVED) {
        isMatch =
          includeComponentIndices.every(
            (index) =>
              index !== -1 &&
              this.entityManager.components[index][entityId] !== undefined &&
              this.entityManager.components[index][entityId]?.removed_at ===
                this.entityManager.getPreviousFlushCounter(),
          ) &&
          excludeComponentIndices.every(
            (index) =>
              index === -1 ||
              this.entityManager.components[index][entityId] === undefined ||
              this.entityManager.components[index][entityId]?.removed_at !==
                this.entityManager.getPreviousFlushCounter(),
          );
      } else {
        throw new Error(`Unknown query type: ${options.type}`);
      }

      if (isMatch) {
        const entity = this.entityManager["entityPool"][entityId];
        entity.reset();
        entities.push(this.entityManager["entityPool"][entityId]);
      }
    }

    return entities;
  }
}
