import { Component, Entity, World } from "../src";

class Position extends Component<{
  x: number;
  y: number;
}> {
  default(): { x: number; y: number } {
    return {
      x: 0,
      y: 0,
    };
  }
}

class Sprite extends Component<{
  image: string;
}> {
  default(): { image: string } {
    return {
      image: "",
    };
  }
}

class Dimensions extends Component<{
  width: number;
  height: number;
}> {
  default(): { width: number; height: number } {
    return {
      width: 0,
      height: 0,
    };
  }
}

describe("world entity creation", () => {
  let world: World;
  let entity1: Entity;
  let entity2: Entity;
  let entity3: Entity;

  beforeEach(() => {
    world = new World();
    entity1 = world.createEntity(Position, Dimensions, Sprite);
    entity2 = world.createEntity(
      new Dimensions({ width: 1, height: 1 }),
      new Position({ x: 1, y: 1 }),
      new Sprite({ image: "entity2.png" }),
    );
    entity3 = world.createEntity(
      new Position({ x: 2, y: 2 }),
      new Sprite({ image: "entity3.png" }),
    );
  });

  test("check entity references correct components", () => {
    expect(entity1).toBeDefined();
    expect(entity1.getComponent(Position)).toBeInstanceOf(Position);
    expect(entity1.getComponent(Dimensions)).toBeInstanceOf(Dimensions);
    expect(entity1.getComponent(Sprite)).toBeInstanceOf(Sprite);
    expect(entity1.getComponent(Position).properties).toEqual({
      x: 0,
      y: 0,
    });
    expect(entity1.getComponent(Dimensions).properties).toEqual({
      width: 0,
      height: 0,
    });
    expect(entity1.getComponent(Sprite).properties).toEqual({
      image: "",
    });

    expect(entity2).toBeDefined();
    expect(entity2.getComponent(Position)).toBeInstanceOf(Position);
    expect(entity2.getComponent(Dimensions)).toBeInstanceOf(Dimensions);
    expect(entity2.getComponent(Sprite)).toBeInstanceOf(Sprite);
    expect(entity2.getComponent(Position).properties).toEqual({
      x: 1,
      y: 1,
    });
    expect(entity2.getComponent(Dimensions).properties).toEqual({
      width: 1,
      height: 1,
    });
    expect(entity2.getComponent(Sprite).properties).toEqual({
      image: "entity2.png",
    });

    expect(entity3).toBeDefined();
    expect(entity3.getComponent(Position)).toBeInstanceOf(Position);
    expect(() => entity3.getComponent(Dimensions)).toThrow(
      "Component Dimensions not found",
    );
    expect(entity3.getComponent(Sprite)).toBeInstanceOf(Sprite);
    expect(entity3.getComponent(Position).properties).toEqual({
      x: 2,
      y: 2,
    });
    expect(entity3.getComponent(Sprite).properties).toEqual({
      image: "entity3.png",
    });
  });

  test("check entity creation with no components", () => {
    const entity4 = world.createEntity();
    expect(entity4).toBeDefined();
    expect(() => entity4.getComponent(Position)).toThrow(
      "Component Position not found",
    );
    expect(() => entity4.getComponent(Dimensions)).toThrow(
      "Component Dimensions not found",
    );
    expect(() => entity4.getComponent(Sprite)).toThrow(
      "Component Sprite not found",
    );
  });

  test("check component index positioning", () => {
    const positionComponentIndex = world[
      "entityManager"
    ].componentListIndexMap.get(Position.name);
    const dimensionsComponentIndex = world[
      "entityManager"
    ].componentListIndexMap.get(Dimensions.name);
    const spriteComponentIndex = world[
      "entityManager"
    ].componentListIndexMap.get(Sprite.name);

    expect(positionComponentIndex).toBe(0);
    expect(dimensionsComponentIndex).toBe(1);
    expect(spriteComponentIndex).toBe(2);

    const entity1Position =
      world["entityManager"].components[positionComponentIndex!][0];
    const entity1Dimensions =
      world["entityManager"].components[dimensionsComponentIndex!][0];
    const entity1Sprite =
      world["entityManager"].components[spriteComponentIndex!][0];
    expect(
      entity1Position,
    ).toBeInstanceOf(Position);
    expect(
      entity1Dimensions,
    ).toBeInstanceOf(Dimensions);
    expect(
      entity1Sprite,
    ).toBeInstanceOf(Sprite);

    const entity2Position =
      world["entityManager"].components[positionComponentIndex!][1];
    const entity2Dimensions =
      world["entityManager"].components[dimensionsComponentIndex!][1];
    const entity2Sprite =
      world["entityManager"].components[spriteComponentIndex!][1];
    expect(
      entity2Position,
    ).toBeInstanceOf(Position);
    expect(
      entity2Dimensions,
    ).toBeInstanceOf(Dimensions);
    expect(
      entity2Sprite,
    ).toBeInstanceOf(Sprite);

    const entity3Position =
      world["entityManager"].components[positionComponentIndex!][2];
    const entity3Dimensions =
      world["entityManager"].components[dimensionsComponentIndex!][2];
    const entity3Sprite =
      world["entityManager"].components[spriteComponentIndex!][2];
    expect(
      entity3Position,
    ).toBeInstanceOf(Position);
    expect(
      entity3Dimensions,
    ).toBeUndefined();
    expect(
      entity3Sprite,
    ).toBeInstanceOf(Sprite);


  });
});
