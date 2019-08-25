import { call } from "cofx";
import { safeUpsert, getCollection } from "../db";

export function* persistGas(ctx, address, gas) {
  const negativeGas = gas * -1;
  yield call(
    safeUpsert,
    ctx.db.collection("AddressGas"),
    { address },
    { $set: { address: address }, $inc: { gas: negativeGas } }
  );
}

export function* resetGasDiscount(ctx, address) {
  yield call(
    safeUpsert,
    ctx.db.collection("AddressGas"),
    { address },
    { $set: { gas: 0 } }
  );
}

export function* getAddressGasCollection(ctx) {
  yield call(getCollection, ctx.db.collection("AddressGas"));
}

export function gasUsedOnBlock(transactions) {
  return transactions.reduce((gasSum, trx) => {
    return gasSum + trx.gas;
  }, 0);
}
