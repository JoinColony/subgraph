const path = require('path');
const { writeFileSync } = require("fs");

const ICOLONY_PATH = process.env.CUSTOM_ICOLONY_PATH ? path.resolve(__dirname, process.env.CUSTOM_ICOLONY_PATH) : path.resolve(__dirname, '..', '..', 'colonyNetwork/build/contracts/IColony.json');
const COINMACHINE_PATH = process.env.CUSTOM_COINMACHINE_PATH ? path.resolve(__dirname, process.env.CUSTOM_COINMACHINE_PATH) : path.resolve(__dirname, '..', '..', 'colonyNetwork/build/contracts/CoinMachine.json');
const IVOTINGREPUTATIONV9_PATH = process.env.CUSTOM_IVOTINGREPUTATIONV9_PATH ? path.resolve(__dirname, process.env.CUSTOM_IVOTINGREPUTATIONV9_PATH) : path.resolve(__dirname, '..', '..', 'colonyNetwork/build/contracts/IVotingReputationV9.json');

const ADDITIONAL_COLONY_ABIS_PATH = path.resolve(__dirname, './additionalColonyAbis.json');
const REMOVED_COLONY_ABIS_PATH = path.resolve(__dirname, './removedColonyAbis.json');
const ADDITIONAL_COINMACHINE_ABIS_PATH = path.resolve(__dirname, './additionalCoinMachineAbis.json');
const V9_VOTING_ABIS_PATH = path.resolve(__dirname, './v9VotingABI.json');

console.log('interfaces path(s)')
console.log('Colony:', ICOLONY_PATH)
console.log('Coin Machine:', COINMACHINE_PATH)

const generateSig = (name, inputs) => `${name}(${inputs.map((parameter) => parameter.type).join(",")})`;

/*
 * Colony
 */
const IColony = require(ICOLONY_PATH);
const additionalColonyAbis = require(ADDITIONAL_COLONY_ABIS_PATH);
const removedColonyAbis = require(REMOVED_COLONY_ABIS_PATH);
const neededColonyAbis = [];
const unneededColonyAbis = [];
const existingColonySigs = IColony.abi.map(({ name, inputs }) => generateSig(name, inputs));

additionalColonyAbis.map((abiEntry) => {
  const { name, inputs } = abiEntry;
  const signature = generateSig(name, inputs);
  // If it doesn't exist, don't add it (this is a sanity check)
  if (existingColonySigs.indexOf(signature) === -1) {
    neededColonyAbis.push(abiEntry);
  }
});

removedColonyAbis.map((abiEntry) => {
  const { name, inputs } = abiEntry;
  const signature = generateSig(name, inputs);
  console.log(name, signature);
  // only attempt to remove it, if it does indeed exist
  if (existingColonySigs.indexOf(signature) >= 0) {
    unneededColonyAbis.push(abiEntry);
  }
});

console.log('ADDING following Colony abis')
console.log(neededColonyAbis)

console.log('REMOVING following Colony abis')
console.log(unneededColonyAbis)

writeFileSync(ICOLONY_PATH, JSON.stringify({
  ...IColony,
  abi: [
    ...IColony.abi,
    ...neededColonyAbis,
  ].filter(({ name, inputs }) => {
    const currentItemSignature = generateSig(name, inputs);
    const foundItem = unneededColonyAbis.find(({ name, inputs }) => generateSig(name, inputs) === currentItemSignature);
    return !foundItem;
  }),
}), {
  encoding: "utf8",
});

/*
 * Coin Machine
 */
const CoinMachine = require(COINMACHINE_PATH);
const additionalCoinMachineAbis = require(ADDITIONAL_COINMACHINE_ABIS_PATH);
const neededCoinMachineAbis = [];
const existingCoinMachineSigs = CoinMachine.abi.map(({ name, inputs }) => generateSig(name, inputs));

additionalCoinMachineAbis.map((abiEntry) => {
  const { name, inputs } = abiEntry;
  const signature = generateSig(name, inputs);
  if (existingCoinMachineSigs.indexOf(signature) === -1) {
    neededCoinMachineAbis.push(abiEntry);
  }
});

console.log('ADDING following Coin Machine abis')
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


/*
 * ReputationVotingV9
 */
const additionalVotingReputationAbis = require(V9_VOTING_ABIS_PATH);

writeFileSync(IVOTINGREPUTATIONV9_PATH, JSON.stringify({
  abi: [
    ...additionalVotingReputationAbis,
  ],
}), {
  encoding: "utf8",
});
