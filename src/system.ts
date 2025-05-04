import { QueryOptions } from "./query";
import { Entity } from "./entity";

export abstract class System {
  public readonly queries: Record<keyof ReturnType<this["schema"]>, Entity[]>;

  constructor() {
    this.queries = Object.fromEntries(
      Object.keys(this.schema()).map((key) => [key, [] as Entity[]]),
    ) as typeof this.queries;
  }

  /**
   * The schema method defines the set of queries for the system.
   */
  public abstract schema(): Record<string, QueryOptions>;

  public abstract execute(): void | Promise<void>;
}
