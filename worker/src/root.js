import { call, all } from "cofx";
import { Stopwatch } from "./utils/stopwatch";
import * as eth from "./eth";
import * as app from "./app";
import { persistGas } from "./addressGas/addressGas";

export const CHECKPOINT_DURATION = 10 * 1000;
export function* root(ctx) {
  const stopwatch = new Stopwatch();
  const startBlock = process.env.START_BLOCK || 8413325;
  const targetBlock = process.env.TARGET_BLOCK || "latest";

  let block = yield call(eth.fetchBlockUntil, ctx, startBlock, targetBlock);
  const addressWithDiscount = [
    "0xD64644e3cC1Be0Ce686c5883c9a1f99C7dC6128C",
    "0xF3fe7508318d7309f235776f7a462CF75803816C",
    "0x4a7618f4229617D91C6289cb813E2e7292Bd2eFC"
  ];

  ctx.log.info(
    {
      startBlock,
      targetBlock
    },
    "Worker started."
  );

  while (block) {
    const processingStart = process.hrtime.bigint();
    ctx.log.debug(
      {
        block: block.number
      },
      `Processing block #${block.number}`
    );
    console.log("BLOOOOOCK ", block);

    // Fetch transactions and logs
    const transactions = yield call(eth.fetchTransactions, ctx, block);

    const gasUsedSum = addressWithDiscount.map(address => {
      return transactions
        .filter(trx => trx.from === address)
        .reduce((gasSum, trx) => {
          return gasSum + trx.gas;
        }, 0);
    });

    // Persist Address - gas
    yield eth.processTransactions(
      ctx,
      addressWithDiscount,
      gasUsedSum,
      persistGas
    );

    block = yield call(eth.fetchBlockUntil, ctx, block.number + 1, targetBlock);
  }
}
