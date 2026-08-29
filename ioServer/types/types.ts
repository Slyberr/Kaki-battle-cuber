export type Player = {
  id: string;
  pseudo: string;
  owner: boolean;
  state: "READY" | "SCORE";
};


export type Room = {
  password: string;
  players: Player[];
  nbrPlayers: number;
  currentSolve: {solveId : number, [idUser: string] : string | number};
  allSolves:  {solveId : number,[idUser: string] : string | number}[];
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
