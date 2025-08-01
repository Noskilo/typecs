export type Properties = {
  [K in string]:
    | string
    | number
    | boolean
    | bigint
    | object
    | null
    | Properties;
};

export abstract class Component<P extends Properties> {
  public data: P;

  public changed = false;

  /**
   * The flush counter value at which this component was marked for removal.
   */
  public removed_at?: number;

  constructor(initial: P) {
    this.data = initial;
  }

  toString() {
    return `${this.constructor.name}:${JSON.stringify(this.data)}`;
  }
}
