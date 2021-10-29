import _ from "lodash";
import BoardService from "./services/board.service";
import BotService from "./services/bot.service";
import MatchService from "./services/match.service";
import { PlayerService } from "./services/player.service";

const config: {
  rows: number;
  columns: number;
  winning_sequence_length: number;
} = {
  rows: 5,
  columns: 5,
  winning_sequence_length: 5,
};

async function moveBot(): Promise<void> {
  console.log("Looking for next move...");
  console.time("Moving");
  const moveTo = await bot.getNextMove();
  console.timeEnd("Moving");

  if (moveTo !== null) {
    board.updateCell(moveTo, { player: bot.uid });
    const sequence = await match.checkSequence(moveTo);

    if (sequence) console.log("WE HAVE A WINNER!", sequence.player);
    print(sequence.sequences?.[0]);
  } else {
    console.log("No available moves");
  }
}

function print(sequence?: number[]) {
  for (let i = 0; i < config.rows; i++) {
    const start = i * config.columns;
    const stop = start + config.columns;
    console.log(
      board.cells
        .map((cell, index) => {
          if (sequence?.length)
            return sequence?.some((id) => id === index)
              ? { ...cell, player: "[X]" }
              : cell;
          else return cell;
        })
        .slice(start, stop)
        .map(({ player }) => player || "...")
        .join(" | ")
    );
  }
}

const board = new BoardService(config);
const player = new PlayerService("hum", "Mat", {});
const bot = new BotService(player, board);
const match = new MatchService([player, bot], board);

const testCells = ["hum", null, null, "bot", null, null, null, null, "hum"];

export function init() {
  board.cells.forEach((cell, index) => {
    const player = _.shuffle(["hum", "bot", null, null, null])[0];
    board.updateCell(index, { ...cell, player });
  });

  print();

  document
    .getElementById("move-bot")
    ?.addEventListener("click", () => moveBot());
}
