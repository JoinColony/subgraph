import { BigInt } from '@graphprotocol/graph-ts'

import {
  OneTxPaymentMade,
  ExtensionInitialised,
  OneTxPayment as OneTxPaymentContract,
} from '../../generated/templates/OneTxPayment/OneTxPayment'

import { OneTxPayment } from '../../generated/schema'

import { handleEvent } from './event'

export function handleExtensionInitialised(event: ExtensionInitialised): void {
  let extension = OneTxPaymentContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("ExtensionInitialised()", event, colony)
}

export function handleOneTxPaymentMade(event: OneTxPaymentMade): void {
  let extension = OneTxPaymentContract.bind(event.address);
  let colony = extension.getColony();

  let otxp = new OneTxPayment(colony.toHexString() + "_oneTxPayment_" + event.params.nPayouts.toString() + "_" + event.params.fundamentalId.toString())
  otxp.fundamentalChainId = event.params.fundamentalId
  otxp.agent = event.params.agent.toHexString()
  otxp.nPayouts = event.params.nPayouts
  otxp.transaction = event.transaction.hash.toHexString()

  if (event.params.nPayouts == BigInt.fromI32(1)){
    otxp.payment = colony.toHexString() + "_payment_" + event.params.fundamentalId.toString()
  } else {
    otxp.expenditure = colony.toHexString() + "_expenditure_" + event.params.fundamentalId.toString()
  }

  otxp.save()

  handleEvent("OneTxPaymentMade(address,uint256,uint256)", event, colony)
}
