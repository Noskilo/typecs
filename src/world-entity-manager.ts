import { Component } from "./component";
import { Entity, EntityId } from "./entity";

export class WorldEntityManager {
  components: (Component<any> | undefined)[][] = [];
  componentListIndexMap: Map<string, number> = new Map();
  entityPool: Entity[] = [];
  /**
   * A pool of dead entities that can be reused.
   * @private
   */
  deadPool: EntityId[] = [];
  /**
   * A buffer of dead entities that are waiting to be added to the dead pool.
   * @private
   */
  deadBuffer: EntityId[] = [];
  stats = {
    entityIdCounter: 0,
    flushCounter: 0
  };

  flush() {
    this.deadPool = this.deadPool.concat(this.deadBuffer);
    this.deadBuffer = [];

    this.stats.flushCounter =
      (this.stats.flushCounter + 1) % Number.MAX_SAFE_INTEGER;
  }
}
