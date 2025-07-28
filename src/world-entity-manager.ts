import { Component } from "./component";
import { Entity, EntityId } from "./entity";

export const MAX_FLUSH_COUNTER = 3000 as const;

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
  deadBuffer: [number, EntityId][] = [];
  stats = {
    entityIdCounter: 0,
    flushCounter: 0,
  };

  flush() {
    while (this.deadBuffer.length > 0) {
      const deadEntity = this.deadBuffer[0];
      if (
        deadEntity === undefined ||
        deadEntity[0] === this.stats.flushCounter
      ) {
        break;
      }

      const deadEntityToPlaceInPool = this.deadBuffer.shift();

      if (deadEntityToPlaceInPool) {
        this.deadPool.push(deadEntityToPlaceInPool[1]);
      }
    }

    this.stats.flushCounter = (this.stats.flushCounter + 1) % MAX_FLUSH_COUNTER;
  }

  getPreviousFlushCounter() {
    return this.stats.flushCounter === 0
      ? MAX_FLUSH_COUNTER - 1
      : this.stats.flushCounter - 1;
  }
}
