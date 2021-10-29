import { MatchStates } from "@/helpers/enums/match-states.enum";
import BoardService from "@/services/board.service";
import BotService from "@/services/bot.service";
import { PlayerService } from "@/services/player.service";

export type players = (PlayerService | BotService)[];

export type id = string;

export type state = MatchStates;

export type board = BoardService;

export type scores = [number, number];

export default interface Match {
  players: players;
  id: id;
  state: state;
  board: board;
  scores: scores;
}
