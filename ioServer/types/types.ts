export type Player = {
  id: string;
  pseudo: string;
  owner: boolean;
  state: "READY" | "SCORE";
};

export type Solve = {
  solveId : number;
  [idUser : string] : string | number
}

export type Room = {
  password: string;
  players: Player[];
  nbrPlayers: number;
  currentSolve: Solve;
  allSolves:  Solve[];
  actualSolveId: number;
  actualScramble: string;
  event:
    | "222"
    | "333"
    | "333oh"
    | "333bf"
    | "333fm"
    | "444"
    | "444bf"
    | "555"
    | "555bf"
    | "666"
    | "777"
    | "fto"
    | "pyram"
    | "skewb"
    | "clock"
    | "minx"
    | "sq1";
};
