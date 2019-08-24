import { call, all } from "cofx";
import { getAddressGasCollection } from "./addressGas";

export async function processResetPeriod(ctx) {
  const discountsFromDB = await ctx.db
    .collection("AddressGas")
    .find()
    .toArray();
  const zeroGasAddresses = discountsFromDB.filter(record => record.gas <= 0);
  const activeAddresses = discountsFromDB.filter(record => record.gas > 0);
  // REMOVE ZeroGasAddresses from DB

  //CAL SMART CONTRACT FUNCTION TO DELETE THE ADDRESS FROM THE ARRAY

  return discountsFromDB;
}

export function processDiscountReset(ctx, addresses, fn) {
  return all(addresses.map(address => call(fn, ctx, address)));
}
