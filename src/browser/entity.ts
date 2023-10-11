import { Character, ICharacter } from "./character";
import { Alliance, IAlliance } from "./alliance";
import { Corporation, ICorporation } from "./corporation";

export type Entity =
  | ICharacter
  | Character
  | ICorporation
  | Corporation
  | IAlliance
  | Alliance;

export type EntityShared = CommonType<ICharacter, ICorporation, IAlliance>;

export type EntityKind = "character" | "corporation" | "alliance";

type SharedKeys<T, U, V> = {
  [K in keyof T]: K extends keyof U ? (K extends keyof V ? K : never) : never;
}[keyof T];

type OnlyInT<T, U, V> = Exclude<keyof T, keyof U & keyof V>;

type CommonType<T, U, V> = {
  [K in SharedKeys<T, U, V>]: T[K]; // Shared properties
} & {
  [K in OnlyInT<T, U, V>]?: T[K]; // Optional properties of T
} & {
  [K in OnlyInT<U, T, V>]?: U[K]; // Optional properties of U
} & {
  [K in OnlyInT<V, T, U>]?: V[K]; // Optional properties of V
};
