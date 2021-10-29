import { Direction } from "@/types/direction.interface";
import SequenceFinderService from "@/services/sequence-finder.service";
import _ from "lodash";

describe("SequenceFinderService", () => {
  const fakeCells = [
    {
      player: "bot",
      coords: {
        x: 1,
        y: 1,
      },
    },
    {
      player: "human",
      coords: {
        x: 2,
        y: 1,
      },
    },
    {
      player: "human",
      coords: {
        x: 3,
        y: 1,
      },
    },
    {
      player: "bot",
      coords: {
        x: 1,
        y: 2,
      },
    },
    {
      player: "human",
      coords: {
        x: 2,
        y: 2,
      },
    },
    {
      player: "human",
      coords: {
        x: 3,
        y: 2,
      },
    },
    {
      player: "bot",
      coords: {
        x: 1,
        y: 3,
      },
    },
    {
      player: "bot",
      coords: {
        x: 2,
        y: 3,
      },
    },
    {
      player: "null",
      coords: {
        x: 3,
        y: 3,
      },
    },
  ];

  let service: SequenceFinderService;

  beforeAll(() => {
    service = new SequenceFinderService(fakeCells, {});
  });

  // _checkNextCell

  it("#_checkNextCell should return the expected sequence", () => {
    const startCell = {
      ...fakeCells[0],
    };
    const direction: Direction = {
      x: 0,
      y: 1,
    };

    const result = service["_checkNextCell"](startCell, direction, []);

    const expected = [3, 6];
    expect(result).toEqual(expected);
  });

  // _findSequence

  it("#_findSequence should resolve the promise", async () => {
    const virtualCell = {
      ...fakeCells[8],
    };
    const horizontal: Direction[] = [
      {
        x: -1,
        y: 0,
      },
      {
        x: 1,
        y: 0,
      },
    ];
    const id = 8;
    // fake _checkNextCell
    spyOn<any>(service, "_checkNextCell").and.callFake((...props) => {
      const direction = props[1];
      if (direction.x > 0) return [];
      else return [7, 6];
    });

    const promise = service["_findSequence"](virtualCell, horizontal, id);

    await expect(promise).resolves.toStrictEqual([6, 7, 8]);
  });

  it("#_findSequence should reject the promise", async () => {
    const virtualCell = {
      ...fakeCells[8],
    };
    const { left, right } = service["_directions"];
    const horizontal = [left, right];
    const id = 8;
    // fake _checkNextCell
    spyOn<any>(service, "_checkNextCell").and.callFake((...props) => {
      const direction = props[1];
      if (direction.x > 0) return [];
      else return [7];
    });

    const promise = service["_findSequence"](virtualCell, horizontal, id);

    await expect(promise).rejects.toStrictEqual([7, 8]);
  });

  // _sequencesPassingThroughThisCell

  it("_sequencesPassingThroughThisCell should resolves", async () => {
    const virtualCell = {
      ...fakeCells[8],
    };
    const id = 8;
    const { left, right } = service["_directions"];
    const horizontal = [left, right];
    // fake _findSequence
    spyOn<any>(service, "_findSequence").and.callFake((...props) => {
      const directions = props[1];
      return new Promise((resolve, reject) =>
        _.isEqual(directions, horizontal) ? resolve([6, 7, 8]) : reject([8])
      );
    });

    const response = service.sequencesPassingThroughThisCell(
      virtualCell,
      id
    );

    await expect(response).resolves.toStrictEqual([6, 7, 8]);
  });

  it("_sequencesPassingThroughThisCell should rejects", async () => {
    const virtualCell = {
      ...fakeCells[8],
    };
    const id = 8;
    const { left, right } = service["_directions"];
    const horizontal = [left, right];
    // fake _findSequence
    spyOn<any>(service, "_findSequence").and.callFake((...props) => {
      const directions = props[1];
      return new Promise((resolve, reject) =>
        _.isEqual(directions, horizontal) ? reject([7, 8]) : reject([8])
      );
    });

    const promise = service.sequencesPassingThroughThisCell(
      virtualCell,
      id
    );
    // This test do not pass because of a babel bug with Promise.any rejection
    // TypeError: getBuiltIn(...) is not a constructor
    await expect(promise).rejects.toBeDefined();
  });
});