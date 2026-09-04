export type Solve = {
  solveId : number | any;
  [idUser : string] : {time: number, finalPenality : 'DNF' | '+2' | '+4' | 'OK'} | any;
}

export type Penality = 'NONE' | 'PLUS_2' | 'DNF';