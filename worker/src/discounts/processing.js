export async function processResetPeriod(
  ctx,
  agregateGasUsage,
  honeySupply,
  minGasPrice
) {
  const discountsFromDB = await ctx.db
    .collection("AddressGas")
    .find()
    .toArray();

  const zeroGasAddresses = discountsFromDB.filter(record => record.gas <= 0);
  const activeAddresses = discountsFromDB.filter(record => record.gas > 0);
  const newGasForPeriod = activeAddresses.map(address => {
    const honeyBalance = 1000;

    return agregateGasUsage * 0.5 * (honeyBalance / honeySupply) * minGasPrice;
  });

  const discountArrays = { addresses: activeAddresses, gas: newGasForPeriod };
  // REMOVE ZeroGasAddresses from DB

  //CAL SMART CONTRACT FUNCTION TO DELETE THE ADDRESS FROM THE ARRAY

  // ADD NEW ADDRESS THAT WE GET FROM THE MIniME trasactions

  return discountArrays;
}
