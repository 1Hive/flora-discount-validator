import { call, all } from "cofx";
import { gasUsedByAddresses } from "./addressGas";

export function processDiscountReset(
  ctx,
  addresses,
  transactions,
  agregateGasUsage,
  honeySupply,
  minGasPrice,
  fn
) {
  return all(
    addresses.map(address => {
      const aggregateAddressDiscount = gasUsedByAddresses(
        address,
        transactions
      );

      // const honeyBalance = web3.call('get_balance', {address})

      // Calculate gas discount
      const gas =
        agregateGasUsage *
        aggregateAddressDiscount *
        (honeyBalance / honeySupply) *
        minGasPrice;

      call(fn, ctx, address, gas);
    })
  );
}
