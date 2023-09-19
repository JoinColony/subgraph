import { ethereum, log, Address, BigInt } from '@graphprotocol/graph-ts'
import { Event, Transaction, Block, GlobalSkill } from '../../generated/schema'
import { JSONEncoder } from "assemblyscript-json/assembly";

export function handleEvent(eventName: String, event: ethereum.Event, associatedColonyAddress: Address): void {
  let eventGid = event.transaction.hash.toHexString() + "_event_" + event.logIndex.toString()
  let eventObj = new Event(eventGid)
  let eventDomainId = '1'

  eventObj.transaction = event.transaction.hash.toHexString()
  eventObj.address = event.address.toHexString()
  eventObj.associatedColony = associatedColonyAddress.toHexString()
  eventObj.timestamp = event.block.timestamp;
  eventObj.name = eventName

  let encoder = new JSONEncoder();
  encoder.pushObject("");

  for (let i = 0; i < event.parameters.length; i += 1) {
    if (event.parameters[i].value.kind == ethereum.ValueKind.STRING) {
      encoder.setString(event.parameters[i].name, event.parameters[i].value.toString())
      log.info("{}", [event.parameters[i].value.toString()])
    } else if (event.parameters[i].value.kind == ethereum.ValueKind.INT || event.parameters[i].value.kind == ethereum.ValueKind.UINT) {
      encoder.setString(event.parameters[i].name, event.parameters[i].value.toBigInt().toString())
      log.info("{}", [event.parameters[i].value.toBigInt().toString()])
    } else if (event.parameters[i].value.kind == ethereum.ValueKind.ADDRESS) {
      encoder.setString(event.parameters[i].name, event.parameters[i].value.toAddress().toHexString())
      log.info("{}", [event.parameters[i].value.toAddress().toHexString()])
    } else if ((event.parameters[i].value.kind == ethereum.ValueKind.FIXED_BYTES) || (event.parameters[i].value.kind == ethereum.ValueKind.BYTES)) {
      encoder.setString(event.parameters[i].name, event.parameters[i].value.toBytes().toHexString())
      log.info("{}", [event.parameters[i].value.toBytes().toHexString()])
    } else if (event.parameters[i].value.kind == ethereum.ValueKind.BOOL) {
      let stringValue: string = event.parameters[i].value.toBoolean() ? 'true' : 'false'
      encoder.setString(event.parameters[i].name, stringValue)
      log.info("{}", [stringValue])
    } else {
      encoder.setString(event.parameters[i].name, "UNKNOWN_PARAMETER_TYPE_UPDATE_SUBGRAPH")
    }

    if (event.parameters[i].name == 'domainId') {
      eventDomainId = event.parameters[i].value.toBigInt().toString()
    }
  }

  eventObj.domain = associatedColonyAddress.toHexString() + '_domain_' + eventDomainId

  // if it's an award/smite event
  if (eventName.includes('ArbitraryReputationUpdate')) {
    let smite = false
    let skillChainId = ''
    let domainId = ''
    for (let i = 0; i < event.parameters.length; i += 1) {
      // if the amount is negative, meaning it's a Smite Action
      if (event.parameters[i].name == 'amount' && event.parameters[i].value.toBigInt().lt(BigInt.fromI32(0))) {
        smite = true
      }
      // set the skill id
      if (event.parameters[i].name == 'skillId') {
        skillChainId = event.parameters[i].value.toBigInt().toString()
      }
    }
    // only the smite action can happen in a subdomain
    // award will always be in root
    if (smite) {
      let skill = GlobalSkill.load('global_skill_' + skillChainId)
      if (skill != null && skill.domainIds != null) {
        for (let index = 0; index < skill.domainIds.length; index += 1) {
          let domainIds = skill.domainIds.concat([])
          let potentialDomainId = domainIds.shift() || ''
          if (potentialDomainId.includes(associatedColonyAddress.toHexString())) {
            domainId = potentialDomainId;
          }
        }
      }
    }
    if (domainId != '') {
      eventObj.domain = domainId
    }
  }

  encoder.popObject();

  eventObj.args = encoder.toString()

  let transaction = Transaction.load(event.transaction.hash.toHexString())
  if (transaction == null) {
    transaction = new Transaction(event.transaction.hash.toHexString())
    transaction.block = "block_" + event.block.number.toString()
    transaction.save()
  }

  let block = Block.load("block_" + event.block.number.toString())
  if (block == null) {
    block = new Block("block_" + event.block.number.toString())
    block.timestamp = event.block.timestamp
    block.save()
  }

  eventObj.save()

}
