import { Component } from "./component";
import { Entity } from "./entity";

import { WorldEntityManager } from "./world-entity-manager";

const Not = (component: typeof Component) => {
  return `!${component.name}`;
};

type QueryOptions = {
  components: (typeof Component | string)[];
};

class QueryDataLoader {
  constructor(private readonly entityManager: WorldEntityManager) {}

  load(options: QueryOptions) {
    const includeComponentIndices: number[] = [];
    const excludeComponentIndices: number[] = [];

    for (const component of options.components) {
      let componentName =
        typeof component === "string" ? component : component.name;
      let isNot = false;

      if (componentName.startsWith("!")) {
        isNot = true;
        componentName = componentName.slice(1);
      }

      const componentIndex =
        this.entityManager.componentListIndexMap.get(componentName);

      if (componentIndex === undefined) {
        throw new Error(`Component ${componentName} not registered`);
      }

      if (isNot) {
        excludeComponentIndices.push(componentIndex);
      } else {
        includeComponentIndices.push(componentIndex);
      }
    }

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
        entities.push(this.entityManager["entityPool"][entityId]);
      }
    }

    return entities;
  }
}
