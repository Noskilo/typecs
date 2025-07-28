import { Component, Properties } from "./component";

import { WorldEntityManager } from "./world-entity-manager";

export type EntityId = number;

export class Entity {
  private flushCounter: number;

  constructor(
    private readonly id: EntityId,
    private readonly entityManager: WorldEntityManager,
  ) {
    this.flushCounter = entityManager.stats.flushCounter;
  }

  private throwIfFlushed() {
    if (this.flushCounter !== this.entityManager.stats.flushCounter) {
      throw new Error("Flushed entity cannot be modified");
    }
  }

  public reset() {
    this.flushCounter = this.entityManager.stats.flushCounter;
  }

  public addComponent<P extends Properties>(componentToAdd: Component<P>) {
    this.throwIfFlushed();

    const componentListIndex = this.entityManager.componentListIndexMap.get(
      componentToAdd.constructor.name,
    );

    if (componentListIndex !== undefined) {
      this.entityManager.components[componentListIndex][this.id] =
        componentToAdd;
    } else {
      this.entityManager.componentListIndexMap.set(
        componentToAdd.constructor.name,
        this.entityManager.components.length,
      );
      const newSet: (Component<P> | undefined)[] = new Array(
        this.entityManager.components[0]?.length ?? 0,
      ).fill(undefined);
      newSet[this.id] = componentToAdd;
      this.entityManager.components.push(newSet);
    }

    const deadEntityIndex = this.entityManager.deadBuffer.indexOf(this.id);
    if (deadEntityIndex !== -1) {
      this.entityManager.deadBuffer.splice(deadEntityIndex, 1);
    }

    return this;
  }

  public removeComponent<P extends Properties, T extends Component<P>>(
    componentRef: new (Properties: P) => T,
  ) {
    this.throwIfFlushed();

    const componentListIndex = this.entityManager.componentListIndexMap.get(
      componentRef.name,
    );
    if (componentListIndex === undefined) {
      return this;
    }

    const component =
      this.entityManager.components[componentListIndex][this.id];

    if (component) {
      component.removed_at = this.entityManager.stats.flushCounter;
    }

    if (
      this.entityManager.components.every(
        (cList) => cList[this.id]?.removed_at !== undefined,
      )
    ) {
      this.entityManager.deadBuffer.push(this.id);
    }

    return this;
  }

  public delete() {
    this.throwIfFlushed();

    for (const components of this.entityManager.components) {
      const component = components[this.id];
      if (component)
        component.removed_at = this.entityManager.stats.flushCounter;
    }

    this.entityManager.deadBuffer.push(this.id);
  }

  public hasComponent<P extends Properties>(
    componentRef: typeof Component<P>,
  ): boolean {
    const componentListIndex = this.entityManager.componentListIndexMap.get(
      componentRef.name,
    );
    if (componentListIndex === undefined) {
      return false;
    }
    return (
      this.entityManager.components[componentListIndex][this.id] !==
        undefined &&
      this.entityManager.components[componentListIndex][this.id]?.removed_at ===
        undefined
    );
  }

  public getComponent<P extends Properties>(
    componentRef: typeof Component<P>,
  ): Component<P> {
    const componentListIndex = this.entityManager.componentListIndexMap.get(
      componentRef.name,
    );
    const componentNotFoundError = `Component ${componentRef.name} not found`;

    if (componentListIndex === undefined) {
      throw new Error(componentNotFoundError);
    }

    const component =
      this.entityManager.components[componentListIndex][this.id];
    if (component === undefined) {
      throw new Error(componentNotFoundError);
    }
    return component;
  }

  public getMutableComponent<P extends Properties>(
    componentRef: typeof Component<P>,
  ): Component<P> {
    this.throwIfFlushed();

    const component = this.getComponent(componentRef);

    component.changed = true;
    return component;
  }
}
