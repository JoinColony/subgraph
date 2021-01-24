import { BigInt, crypto, ByteArray, Bytes } from '@graphprotocol/graph-ts'
import { log } from '@graphprotocol/graph-ts'

import {
  TokensBought,
  PeriodUpdated,
} from '../../generated/templates/CoinMachine/CoinMachine'

import {
  CoinMachine as CoinMachineContract
} from '../../generated/templates/CoinMachine/CoinMachine'

import { handleEvent } from './event'

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
