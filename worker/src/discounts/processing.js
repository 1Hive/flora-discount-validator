import { call, all } from "cofx";

export function processDiscountReset(ctx, addresses, fn) {
  return all(addresses.map(address => call(fn, ctx, address)));
}
