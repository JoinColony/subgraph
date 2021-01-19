import { BigInt, crypto, ByteArray, Bytes, Address } from '@graphprotocol/graph-ts'

import { log } from '@graphprotocol/graph-ts'

import {
  IColonyNetwork,
  ColonyAdded,
  ExtensionInstalled
} from '../../generated/ColonyNetwork/IColonyNetwork'

import { Colony, Domain, ColonyMetadata } from '../../generated/schema'
import { Colony as ColonyTemplate, OneTxPayment as OneTxPaymentTemplate } from '../../generated/templates'
import { createToken } from './token'

export function handleColonyAdded(event: ColonyAdded): void {
  let rootDomain = new Domain(event.params.colonyAddress.toHex() + '_domain_1')
  rootDomain.domainChainId = new BigInt(1)
  rootDomain.metadata = ""
  rootDomain.save()

  let colony = Colony.load(event.params.colonyAddress.toHex())
  if (colony == null) {
    colony = new Colony(event.params.colonyAddress.toHexString())
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
