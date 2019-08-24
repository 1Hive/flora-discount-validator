import { call, all } from "cofx";
import abi from "web3-eth-abi";

export function fetchTransactions(_, block) {
  return block.transactions.map(tx => {
    tx.timestamp = block.timestamp;

    return tx;
  });
}

export function processTransactions(ctx, addresses, gasCosts, fn) {
  return all(
    addresses.map((address, index) => call(fn, ctx, address, gasCosts[index]))
  );
}
