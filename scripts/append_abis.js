const path = require('path');
const { writeFileSync } = require("fs");

const ICOLONY_PATH = process.env.CUSTOM_ICOLONY_PATH ? path.resolve(__dirname, process.env.CUSTOM_ICOLONY_PATH) : path.resolve(__dirname, '..', '..', 'colonyNetwork/build/contracts/IColony.json');
const COINMACHINE_PATH = process.env.CUSTOM_COINMACHINE_PATH ? path.resolve(__dirname, process.env.CUSTOM_COINMACHINE_PATH) : path.resolve(__dirname, '..', '..', 'colonyNetwork/build/contracts/CoinMachine.json');

const ADDITIONAL_COLONY_ABIS_PATH = path.resolve(__dirname, './additionalColonyAbis.json');
const ADDITIONAL_COINMACHINE_ABIS_PATH = path.resolve(__dirname, './additionalCoinMachineAbis.json');

console.log('interfaces path(s)')
console.log('Colony:', ICOLONY_PATH)
console.log('Coin Machine:', COINMACHINE_PATH)

/*
 * Colony
 */
const IColony = require(ICOLONY_PATH);
const additionalColonyAbis = require(ADDITIONAL_COLONY_ABIS_PATH);
const neededColonyAbis = [];
const existingColonySigs = IColony.abi.map(({ name, inputs }) => `${name}(${inputs.map((parameter) => parameter.type).join(",")})`);

additionalColonyAbis.map((abiEntry) => {
  const { name, inputs } = abiEntry;
  const signature = `${name}(${inputs.map((parameter) => parameter.type).join(",")})`;
  if (existingColonySigs.indexOf(signature) === -1) {
    neededColonyAbis.push(abiEntry);
  }
});

console.log('Adding following Colony abis')
console.log(neededColonyAbis)

writeFileSync(ICOLONY_PATH, JSON.stringify({
  ...IColony,
  abi: [
    ...IColony.abi,
    ...neededColonyAbis,
  ],
}), {
  encoding: "utf8",
});


/*
 * Coin Machine
 */
const CoinMachine = require(COINMACHINE_PATH);
const additionalCoinMachineAbis = require(ADDITIONAL_COINMACHINE_ABIS_PATH);
const neededCoinMachineAbis = [];
const existingCoinMachineSigs = CoinMachine.abi.map(({ name, inputs }) => `${name}(${inputs.map((parameter) => parameter.type).join(",")})`);

additionalCoinMachineAbis.map((abiEntry) => {
  const { name, inputs } = abiEntry;
  const signature = `${name}(${inputs.map((parameter) => parameter.type).join(",")})`;
  if (existingCoinMachineSigs.indexOf(signature) === -1) {
    neededCoinMachineAbis.push(abiEntry);
  }
});

console.log('Adding following Coin Machine abis')
console.log(neededCoinMachineAbis)

writeFileSync(COINMACHINE_PATH, JSON.stringify({
  ...CoinMachine,
  abi: [
    ...CoinMachine.abi,
    ...neededCoinMachineAbis,
  ],
}), {
  encoding: "utf8",
});
