import { BigInt, crypto, ByteArray, Bytes } from '@graphprotocol/graph-ts'
import { log } from '@graphprotocol/graph-ts'

import { OneTxPaymentMade } from '../../generated/templates/OneTxPayment/OneTxPayment'

import { OneTxPayment, Transaction, Block } from '../../generated/schema'

import { OneTxPayment as OneTxPaymentContract } from '../../generated/templates/OneTxPayment/OneTxPayment'

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

  let transaction = Transaction.load(event.transaction.hash.toHexString())
  if (transaction == null){
    transaction = new Transaction(event.transaction.hash.toHexString())
    transaction.block = "block_" + event.block.number.toString()
    transaction.save()
  }

  let block = Block.load("block_" + event.block.number.toString())
  if (block == null){
    block = new Block(event.block.number.toString())
    block.timestamp = event.block.timestamp
    block.save()
  }


}

