import { BigInt } from '@graphprotocol/graph-ts'
import { CoinMachinePeriod } from '../../generated/schema';

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

  let numTokens = event.params.numTokens;
  let periodLength = extension.getPeriodLength();
  let periodPrice = extension.getCurrentPrice();

  let blockTime = event.block.timestamp;

  // Get the timestamp of when the current period is supposed to end and convert it to milliseconds
  // blockTime.minus(blockTime.mod(periodLength)) when did the period started
  // .plus(periodLength) when it's going to end
  let salePeriodEnd = blockTime.minus(blockTime.mod(periodLength)).plus(periodLength).times(BigInt.fromI32(1000));

  let periodId = colony.toHexString() + "_coinMachine_" + extension._address.toHexString() + '_' + salePeriodEnd.toString();
  let coinMachinePeriod = CoinMachinePeriod.load(periodId);

  if (coinMachinePeriod != null) {
    coinMachinePeriod.tokensBought = coinMachinePeriod.tokensBought.plus(numTokens);
    coinMachinePeriod.price = periodPrice;

    coinMachinePeriod.save();
  } else {
    coinMachinePeriod = new CoinMachinePeriod(periodId)
    coinMachinePeriod.saleEndedAt = salePeriodEnd;
    coinMachinePeriod.colonyAddress = colony.toHexString();
    coinMachinePeriod.tokensBought = BigInt.fromI32(0).plus(numTokens);
    coinMachinePeriod.price = periodPrice;

    coinMachinePeriod.save();
  }

  handleEvent("TokensBought(address,uint256,uint256)", event, colony)
}

export function handlePeriodUpdated(event: PeriodUpdated): void {
  let extension = CoinMachineContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("PeriodUpdated(uint256,uint256)", event, colony)
}
