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

export abstract class Component<P extends Properties = any> {
  public data: P;

  public changed = false;

  constructor();
  constructor(initial: P);
  constructor(initial?: P) {
    this.data = initial ?? this.default();
  }

  abstract default(): P;

  toString() {
    return `${this.constructor.name}:${JSON.stringify(this.data)}`;
  }
}
