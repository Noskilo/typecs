import { QueryOptions } from "./query";
import { Entity } from "./entity";
import { World } from "./world";

export abstract class System {
  public deltaTime = 0;
  public lastTime = 0;
  public readonly queries: Record<keyof ReturnType<this["schema"]>, Entity[]>;

  public world!: World;

  constructor() {
    this.queries = Object.fromEntries(
      Object.keys(this.schema()).map((key) => [key, [] as Entity[]]),
    ) as typeof this.queries;
  }

  public initialize(): void | Promise<void> {
    return;
  }

  public finalize(): void {
    return;
  }

  /**
   * The schema method defines the set of queries for the system.
   */
  public abstract schema(): Record<string, QueryOptions>;

  public abstract execute(): void | Promise<void>;
}
