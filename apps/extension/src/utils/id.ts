import { customAlphabet } from "nanoid";

type Prefix = "acc" | "port" | "mail";

const pool = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
export const nanoid = customAlphabet(pool, 21);

export function id(prefix?: Prefix, length?: number) {
  if (!prefix) return nanoid(length);
  return `${prefix}_${nanoid(length)}`;
}
