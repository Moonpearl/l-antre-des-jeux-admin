import { BoardGame } from "./boardgameatlas";

export default interface SearchResults {
  count: number;
  games: BoardGame[];
}
