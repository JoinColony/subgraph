import { Address, BigInt, dataSource, ethereum, log } from '@graphprotocol/graph-ts'
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
  }

  handleEvent("TokensBought(address,uint256,uint256)", event, colony)
}

export function handlePeriodUpdated(event: PeriodUpdated): void {
  let extension = CoinMachineContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("PeriodUpdated(uint256,uint256)", event, colony)
}

export function handleBlock(block: ethereum.Block): void {
  let coinMachineAddress = dataSource.address()
  let coinMachineExtension = CoinMachineContract.bind(coinMachineAddress);

  let periodLengthCall = coinMachineExtension.try_getPeriodLength();
  let versionCall = coinMachineExtension.try_version();

  let blockTime = block.timestamp;

  if (!periodLengthCall.reverted && !versionCall.reverted && versionCall.value.toI32() >= 2) {
    let periodLength = periodLengthCall.value;

    if (!periodLength.isZero()) {
      let activeTokenSold = coinMachineExtension.getActiveSold();
      let tokenBalance = coinMachineExtension.getTokenBalance();
      let periodPrice = coinMachineExtension.getCurrentPrice();


      // If there's no sold tokens and the balance is zero then this is a "paused" sale period
      if (!activeTokenSold.isZero() || !tokenBalance.isZero()) {
        let colonyAddress = coinMachineExtension.getColony();

        // Get the timestamp of when the current period is supposed to end and convert it to milliseconds
        // blockTime.minus(blockTime.mod(periodLength)) when did the period started
        // .plus(periodLength) when it's going to end
        let salePeriodEnd = blockTime.minus(blockTime.mod(periodLength)).plus(periodLength).times(BigInt.fromI32(1000));

        let periodId = colonyAddress.toHexString() + "_coinMachine_" + coinMachineAddress.toString() + '_' + salePeriodEnd.toString();
        let coinMachinePeriod = CoinMachinePeriod.load(periodId);

        if (coinMachinePeriod == null) {
          coinMachinePeriod = new CoinMachinePeriod(periodId)
          coinMachinePeriod.saleEndedAt = salePeriodEnd;
          coinMachinePeriod.tokensBought = BigInt.fromI32(0);
          coinMachinePeriod.price = periodPrice;

          coinMachinePeriod.save();
        }
      }
    }
  }
}
