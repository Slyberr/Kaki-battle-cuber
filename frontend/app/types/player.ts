export type Player = {
  id: string;
  pseudo: string;
  owner: boolean;
  state: "READY" | "SCORE";
};
