import { Component, Entity, System, World } from "../src";

class Position extends Component<{
  x: number;
  y: number;
}> {}

class Sprite extends Component<{
  image: string;
}> {}

class Dimensions extends Component<{
  width: number;
  height: number;
}> {}

class MoveSystem extends System {
  public schema() {
    return {
      entitiesWithPositionsAndDimensions: {
        include: [Position, Dimensions],
      },
      noDimensions: {
        include: [Position],
        exclude: [Dimensions],
      },
    };
  }

  execute(): void {
    this.queries.entitiesWithPositionsAndDimensions.forEach((entity) => {
      const position = entity.getMutableComponent(Position);
      const dimensions = entity.getMutableComponent(Dimensions);

      if (position && dimensions) {
        position.data.x += 1;
        position.data.y += 1;
      }
    });
  }
}

describe("query components", () => {
  let world: World;
  let entity1: Entity;
  let entity2: Entity;
  let entity3: Entity;

  const defaultPosition = () =>
    new Position({
      x: 0,
      y: 0,
    });

  const defaultDimension = () =>
    new Dimensions({
      width: 0,
      height: 0,
    });

  const defaultSprite = () =>
    new Sprite({
      image: "",
    });

  beforeEach(() => {
    world = new World();
    entity1 = world.createEntity(
      defaultPosition(),
      defaultDimension(),
      defaultSprite(),
    );
    entity2 = world.createEntity(
      new Dimensions({ width: 1, height: 1 }),
      new Position({ x: 1, y: 1 }),
      new Sprite({ image: "entity2.png" }),
    );
    entity3 = world.createEntity(
      new Position({ x: 2, y: 2 }),
      new Sprite({ image: "entity3.png" }),
    );

    world.addSystem(MoveSystem);
  });

  test("move system", async () => {
    await world.execute();
    const query = world.query({
      include: [Position, Dimensions],
    });

    expect(query).toHaveLength(2);
    expect(query[0]).toBe(entity1);
    expect(query[1]).toBe(entity2);

    expect(query[0].getComponent(Position).data).toEqual({
      x: 1,
      y: 1,
    });
  });

  test("query with include components", () => {
    const query = world.query({
      include: [Position, Dimensions],
    });

    expect(query).toHaveLength(2);
    expect(query[0]).toBe(entity1);
    expect(query[1]).toBe(entity2);
  });

  test("query with exclude components", () => {
    const query = world.query({
      include: [Position],
      exclude: [Dimensions],
    });

    expect(query).toHaveLength(1);
    expect(query[0]).toBe(entity3);
  });

  test("query with mixed include and exclude components", () => {
    const query = world.query({
      include: [Position],
      exclude: [Sprite],
    });

    expect(query).toHaveLength(0);
  });

  test("system", () => {});
});
