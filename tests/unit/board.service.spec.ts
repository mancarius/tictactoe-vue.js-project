import BoardService from "@/services/board.service";
import * as Board from "@/types/board-types.interface";
import _ from "lodash";

describe("BoardService", () => {
  let service: BoardService;

  beforeAll(() => {
    service = new BoardService();
  });

  // _init

  it("#_init should populate the cells array after class contruction", () => {
    const expected = 9;
    expect(service.cells.length).toBe(expected);
  });

  // _getRow

  it("#_getRow should return the correct row number", () => {
    const position = 6;
    const expected = 2;

    expect(service["_getRow"](position)).toBe(expected);
  });

  // _getColumn

  it("#_getColumn should return the correct column number", () => {
    const position = 6;
    const row = 2;
    const expected = 3;

    expect(service["_getColumn"](position, row)).toBe(expected);
  });

  // cells

  it("#cells should return an array of object", () => {
    const allElemsAreObject = service.cells.every((cell) => _.isObject(cell));
    expect(allElemsAreObject).toBeTruthy();
  });

  // updateCellAndReturnNewCells

  it("#updateCellAndReturnNewCells should update correctly the required cell", () => {
    const index = 2;
    const props = { player: "bot" };
    const fakeCellCollection = [
      { player: null },
      { player: null },
      { player: null },
    ];

    const newCellCollection = BoardService.updateCellAndReturnNewCells(
      index,
      props,
      fakeCellCollection as Board.cell[]
    );

    const expected = props.player;
    expect(newCellCollection[index].player).toMatch(expected);
  });

  // _getEmptyCellIndexes

  it("#_getEmptyCellIndexes should return an array of 3 numbers", () => {
    const fakeCellCollection = _.shuffle(
      Array(3)
        .fill([{ player: "human" }, { player: "bot" }, { player: null }])
        .flat()
    );

    const emptyCellsIndexes =
      BoardService._getEmptyCellIndexes(fakeCellCollection);

    const isArrayOfNumber = emptyCellsIndexes.every(
      (n) => typeof n === "number"
    );
    const expectedLength = 3;
    expect(isArrayOfNumber).toBeTruthy();
    expect(emptyCellsIndexes.length).toBe(expectedLength);
  });

  // getBestPlayerMoves
  it("#getBestPlayerMoves");

  // _findBestPlayerMoves

  // _createCrawlerList

  // _sendCrawler
});
