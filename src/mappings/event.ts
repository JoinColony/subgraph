import { ethereum, log, Address } from '@graphprotocol/graph-ts'
import { Event, Transaction, Block } from '../../generated/schema'
import { JSONEncoder } from "assemblyscript-json/assembly";

export function handleEvent(eventName: String, event: ethereum.Event, associatedColonyAddress: Address): void {
  let eventGid = event.transaction.hash.toHexString() + "_event_" + event.logIndex.toString()
  let eventObj = new Event(eventGid)
  eventObj.transaction = event.transaction.hash.toHexString()
  eventObj.address = event.address.toHexString()
  eventObj.associatedColony = associatedColonyAddress.toHexString()
  eventObj.name = eventName

  let encoder = new JSONEncoder();
  encoder.pushObject("");

  for (let i = 0; i< event.parameters.length; i += 1){
   if (event.parameters[i].value.kind == ethereum.ValueKind.STRING){
     encoder.setString(event.parameters[i].name, event.parameters[i].value.toString())
     log.info("{}", [event.parameters[i].value.toString()])
   } else if (event.parameters[i].value.kind == ethereum.ValueKind.INT || event.parameters[i].value.kind == ethereum.ValueKind.UINT ){
     encoder.setString(event.parameters[i].name, event.parameters[i].value.toBigInt().toString())
     log.info("{}", [event.parameters[i].value.toBigInt().toString()])
   } else if (event.parameters[i].value.kind == ethereum.ValueKind.ADDRESS){
     encoder.setString(event.parameters[i].name, event.parameters[i].value.toAddress().toHexString())
     log.info("{}", [event.parameters[i].value.toAddress().toHexString()])
    } else {
      encoder.setString(event.parameters[i].name, "UNKNOWN_PARAMETER_TYPE_UPDATE_SUBGRAPH")
    }
  }

  encoder.popObject();

  eventObj.args = encoder.toString()

  let transaction = Transaction.load(event.transaction.hash.toHexString())
  if (transaction == null){
    transaction = new Transaction(event.transaction.hash.toHexString())
    transaction.block = "block_" + event.block.number.toString()
    transaction.save()
  }

  let block = Block.load("block_" + event.block.number.toString())
  if (block == null){
    block = new Block("block_" + event.block.number.toString())
    block.timestamp = event.block.timestamp
    block.save()
  }

  eventObj.save()

}
