import { createStore } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { Player } from "@/@core/domain/player";
import { PlayerID } from "../domain/player-id";

export class PlayerZustand {
  constructor(public id: string, public name: string, public points: number) {}

  toAggregate(): Player {
    return Player.with(PlayerID.with(this.id), this.name, this.points);
  }

  static from(player: Player): PlayerZustand {
    return new PlayerZustand(
      player.getId().getValue(),
      player.getName(),
      player.getPoints()
    );
  }

  static map(players: PlayerZustand[]) {
    return players.map((player) => PlayerZustand.create(player));
  }

  static create(players: PlayerZustand) {
    return new PlayerZustand(players.id, players.name, players.points);
  }
}

export interface PlayerStore {
  create: (player: PlayerZustand) => void;
  update: (player: PlayerZustand) => void;
  delete: (playerId: string) => void;
  findById: (playerId: string) => PlayerZustand | undefined;
  findAll: (playerName?: string) => PlayerZustand[];
}

interface Store {
  players: PlayerZustand[];
}

export const playerStore = createStore<Store & PlayerStore>()(
  persist(
    (set, get) => ({
      players: [],
      create: (player: PlayerZustand) => {
        set((state) => {
          const players = state.players;
          players.push(player);

          return { players: players };
        });
      },
      update: (player: PlayerZustand) => {
        set((state) => {
          const players = state.players;

          const index = players.findIndex((p) => p.id === player.id);

          players.splice(index, 1);
          players.push(player);

          return { players: players };
        });
      },
      delete: (playerId: string) => {
        set((state) => {
          const players = state.players;

          const index = players.findIndex((p) => p.id === playerId);

          players.splice(index, 1);

          return { players: players };
        });
      },
      findById: (playerId: string) => {
        const result = get().players.find((player) => player.id === playerId);

        if (result) {
          return PlayerZustand.create(result);
        }
      },
      findAll: (playerName?: string) => {
        if (playerName) {
          const result = get().players.filter(
            (player) => player.name === playerName
          );

          return PlayerZustand.map(result);
        }

        return PlayerZustand.map(get().players);
      },
    }),
    {
      name: "players",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
