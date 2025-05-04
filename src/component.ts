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
  public properties: P;

  public changed = false;

  constructor();
  constructor(properties: P);
  constructor(properties?: P) {
    this.properties = properties ?? this.default();
  }

  abstract default(): P;

  toString() {
    return `${this.constructor.name}:${JSON.stringify(this.properties)}`;
  }
}
