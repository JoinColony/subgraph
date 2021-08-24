import { Address, ByteArray, crypto, ethereum } from '@graphprotocol/graph-ts'
import { ColonyExtension } from '../../generated/schema';

import {
  ExtensionInitialised,
  TokensBought,
  PeriodUpdated,
  CoinMachine as CoinMachineContract,
} from '../../generated/templates/CoinMachine/CoinMachine'

import { handleEvent } from './event'

export function handleExtensionInitialised(event: ExtensionInitialised): void {
  let extension = CoinMachineContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("ExtensionInitialised()", event, colony)
}

export function handleTokensBought(event: TokensBought): void {
  let extension = CoinMachineContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("TokensBought(address,uint256,uint256)", event, colony)
}

export function handlePeriodUpdated(event: PeriodUpdated): void {
  let extension = CoinMachineContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("PeriodUpdated(uint256,uint256)", event, colony)
}

export function handleBlock(block: ethereum.Block): void {
    const COIN_MACHINE = crypto.keccak256(ByteArray.fromUTF8("CoinMachine")).toHexString()
    const { address: coinMachineAddress } = ColonyExtension.load(COIN_MACHINE);
    const coinMachineExtension = CoinMachineContract.bind((coinMachineAddress as unknown) as Address);
    console.log(coinMachineExtension)
    const periodLength = coinMachineExtension.getPeriodLength();
    const windowSize = coinMachineExtension.getWindowSize();
    const targetPerPeriod = coinMachineExtension.getTargetPerPeriod();
    const blockTime = block.timestamp;

    // let period = new CoinMachinePeriod(colonyAddress + "_coinMachine_" + coinMachineExtension.address + '_' + timestamp.toString());
    console.log(periodLength, windowSize, targetPerPeriod, blockTime);
}
