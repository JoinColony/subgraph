import { BigInt, crypto, ByteArray, Bytes, Address } from '@graphprotocol/graph-ts'

import { log } from '@graphprotocol/graph-ts'

import {
  IColonyNetwork,
  ColonyAdded,
  ExtensionInstalled,
  ColonyLabelRegistered
} from '../../generated/ColonyNetwork/IColonyNetwork'

import { handleEvent } from './event'

import { Colony, Domain } from '../../generated/schema'
import { Colony as ColonyTemplate, OneTxPayment as OneTxPaymentTemplate } from '../../generated/templates'
import { createToken } from './token'
import { IColonyNetwork as ColonyNetworkContract } from '../../generated/ColonyNetwork/IColonyNetwork'

export function handleColonyAdded(event: ColonyAdded): void {
  let rootDomain = new Domain(event.params.colonyAddress.toHex() + '_domain_1')
  rootDomain.domainChainId = new BigInt(1)
  rootDomain.metadata = ""
  rootDomain.save()

  let colony = Colony.load(event.params.colonyAddress.toHex())
  if (colony == null) {
    colony = new Colony(event.params.colonyAddress.toHexString())
    let colonyNetwork = ColonyNetworkContract.bind(Address.fromString(event.address.toHexString()))
    log.info('---------------------', []);
    log.info('Colony Address: {} ENS Name: {}', [event.params.colonyAddress.toHexString(), colonyNetwork.lookupRegisteredENSDomain(Address.fromString(event.params.colonyAddress.toHexString()))]);
    log.info('---------------------', []);
    let ensName = colonyNetwork.try_lookupRegisteredENSDomain(Address.fromString(event.params.colonyAddress.toHexString()))
    if (ensName.reverted) {
      colony.ensName = null;
    } else {
      colony.ensName = ensName.value;
    }
    colony.metadata = ""
  }

  let tokenAddress = event.params.token.toHexString()
  createToken(tokenAddress)

  colony.colonyChainId = event.params.colonyId
  colony.token = tokenAddress
  colony.domains = [rootDomain.id]
  colony.save()

  ColonyTemplate.create(event.params.colonyAddress)
}

export function handleColonyLabelRegistered(event: ColonyLabelRegistered): void {
  let colony = Colony.load(event.params.colony.toHex())
  let colonyNetwork = ColonyNetworkContract.bind(Address.fromString(event.address.toHexString()))

  if (!colony.ensName) {
    let ensName = colonyNetwork.try_lookupRegisteredENSDomain(Address.fromString(event.params.colony.toHexString()))
    if (ensName.reverted) {
      colony.ensName = null;
    } else {
      colony.ensName = ensName.value;
    }
  }

  colony.save()

  handleEvent("ColonyLabelRegistered(address,bytes32)", event, event.address)
}

export function handleExtensionInstalled(event: ExtensionInstalled): void {
  let ONE_TX_PAYMENT = crypto.keccak256(ByteArray.fromUTF8("OneTxPayment")).toHexString()
  log.info("ExtensionInstalled event seen, {}, {}", [event.params.extensionId.toHexString(), ONE_TX_PAYMENT]);
  if (event.params.extensionId.toHexString() == ONE_TX_PAYMENT) {
    let cn = IColonyNetwork.bind(event.address);
    let extensionAddress = cn.getExtensionInstallation(<Bytes>ByteArray.fromHexString(ONE_TX_PAYMENT), event.params.colony)
    log.info("Adding extension at address {}", [extensionAddress.toHexString()]);

    OneTxPaymentTemplate.create(extensionAddress)
  }
}
