export const CERTIFIER_ADDRESS = "0x218ff446db9a74b7a391047281d34943e30a6574";
export const HONEY_ADDRESS = "0xDfD1f311977c282c15F88686426E65062B20a87a";

export const minGasPrice = await ctx.web3.eth.getGasPrice();

const certifierABI = require(`./abis/HiveCertifier.json`);
const erc20ABI = require(`./abis/ERC20.json`);

export const Certifier = new ctx.web3.eth.Contract(
  certifierABI,
  CERTIFIER_ADDRESS
);
export const Honey = new ctx.web3.eth.Contract(erc20ABI, MINIME_TOKEN_ADDRESS);
