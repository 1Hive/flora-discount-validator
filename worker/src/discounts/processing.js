import { call, all } from "cofx";
import { getAddressGasCollection } from "./addressGas";

export function* processResetPeriod(
  ctx,
  agregateGasUsage,
  honeySupply,
  minGasPrice
) {
  const discountsFromDB = yield Promise.resolve(
    ctx.db
      .collection("AddressGas")
      .find()
      .toArray()
  );
  const zeroGasAddresses = discountsFromDB.filter(record => record.gas <= 0);
  const activeAddresses = discountsFromDB.filter(record => record.gas > 0);
  console.log("activeAddresses ", activeAddresses);

  const newGasForPeriod = activeAddresses.map(address => {
    const honeyBalance = 1000;

    return agregateGasUsage * 0.5 * (honeyBalance / honeySupply) * minGasPrice;
  });

  const addressesToArray = activeAddresses.map(active => active.address);

  const discountArray = {
    addresses: addressesToArray,
    gas: newGasForPeriod
  };
  console.log("zeroGasAddresses ", zeroGasAddresses);
  // REMOVE ZeroGasAddresses from DB
  zeroGasAddresses.forEach(element => {
    console.log(element.address);
    try {
      ctx.db
        .collection("AddressGas")
        .deleteOne({ address: element.address.toString() });
    } catch (error) {
      console.log(error);
    }
  });

  // ctx.db.collection("AddressGas").remove({ address: "1" });

  //CAL SMART CONTRACT FUNCTION TO DELETE THE ADDRESS FROM THE ARRAY

  return discountArray;
}
