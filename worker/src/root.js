import { call, all } from "cofx";
import { Stopwatch } from "./utils/stopwatch";
import * as eth from "./eth";
import * as discounts from "./discounts";
import { persistGas, gasUsedOnBlock } from "./discounts/addressGas";
import { minGasPrice, Certifier, Honey } from "./discounts/contracts";

export const CHECKPOINT_DURATION = 10 * 1000;
export const PERIOD_RESET = 2;

export function* root(ctx) {
  const stopwatch = new Stopwatch();
  const startBlock = process.env.START_BLOCK || 6592900;
  const targetBlock = process.env.TARGET_BLOCK || 6592903;
  let block_counter = 0;
  let agregateGasUsage = 0;
  let addressBatch; // TODO: Process new active addressess on batches

  let block = yield call(eth.fetchBlockUntil, ctx, startBlock, targetBlock);

  const addressesWithDiscount = await Certifier.methods.activeAddresses().call()

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
    // console.log("BLOOOOOCK ", block);
    const transactions = yield call(eth.fetchTransactions, ctx, block);

    if (block_counter == PERIOD_RESET) {
      block_counter = 0;
      console.log(
        "********************** REEEEESEEEEEETTTTTTTTTT ***********************"
      );
      agregateGasUsage += gasUsedOnBlock(transactions);

      const honeySupply = await Honey.methods.totalSupply().call()
      const discountsArray = yield discounts.processResetPeriod(
        ctx,
        agregateGasUsage,
        honeySupply,
        minGasPrice
      );
      console.log("NEW DISCOUNT ARRAY ", discountsArray);
      agregateGasUsage = 0;

      //Reset gas discount from DB
    } else {
      const gasUsedSum = addressesWithDiscount.map(address => {
        return transactions
          .filter(trx => trx.from === address)
          .reduce((gasSum, trx) => {
            return gasSum + trx.gas;
          }, 0);
      });

      agregateGasUsage += gasUsedOnBlock(transactions);

      // Persist Address - gas
      yield eth.processTransactions(
        ctx,
        addressesWithDiscount,
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
  console.log("agregateGasUsage ", agregateGasUsage);
}
