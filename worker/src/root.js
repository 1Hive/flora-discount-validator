import { call, all } from "cofx";
import { Stopwatch } from "./utils/stopwatch";
import * as eth from "./eth";
import * as discounts from "./discounts";
import { persistGas } from "./discounts/addressGas";

export const CHECKPOINT_DURATION = 10 * 1000;
export const PERIOD_RESET = 5;

export function* root(ctx) {
  const stopwatch = new Stopwatch();
  const startBlock = process.env.START_BLOCK || 6592900;
  const targetBlock = process.env.TARGET_BLOCK || 6592906;
  let block_counter = 0;

  let block = yield call(eth.fetchBlockUntil, ctx, startBlock, targetBlock);
  const addressWithDiscount = [
    "0xD64644e3cC1Be0Ce686c5883c9a1f99C7dC6128C",
    "0xF3fe7508318d7309f235776f7a462CF75803816C",
    "0x4a7618f4229617D91C6289cb813E2e7292Bd2eFC",
    "0x0FB166dd6Ea14BCbd688419EB23325B6c2BdF76B",
    "0xF96D424c1B422E7d6af4369B8304C6860B29235b"
  ];

  ctx.log.info(
    {
      startBlock,
      targetBlock
    },
    "Worker started."
  );

  while (block) {
    ctx.log.debug(
      {
        block: block.number
      },
      `Processing block #${block.number}`
    );
    console.log("BLOOOOOCK ", block);

    if (block_counter == PERIOD_RESET) {
      block_counter = 0;
      console.log(
        "********************** REEEEESEEEEEETTTTTTTTTT ***********************"
      );
      //Reset gas discount from DB
      yield discounts.processDiscountReset(
        ctx,
        addressWithDiscount,
        discounts.resetGasDiscount
      );
    } else {
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
        discounts.persistGas
      );

      block = yield call(
        eth.fetchBlockUntil,
        ctx,
        block.number + 1,
        targetBlock
      );
      block_counter = block_counter + 1;
    }
  }
}
