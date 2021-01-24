import { BigInt, crypto, ByteArray, Bytes, Address } from '@graphprotocol/graph-ts'

import { log } from '@graphprotocol/graph-ts'

import {
  IColonyNetwork,
  ColonyNetworkInitialised,
  TokenLockingAddressSet,
  MiningCycleResolverSet,
  NetworkFeeInverseSet,
  TokenWhitelisted,
  ColonyVersionAdded,
  MetaColonyCreated,
  ColonyAdded,
  SkillAdded,
  AuctionCreated,
  ReputationMiningInitialised,
  ReputationMiningCycleComplete,
  ReputationRootHashSet,
  UserLabelRegistered,
  ColonyLabelRegistered,
  ReputationMinerPenalised,
  ExtensionAddedToNetwork,
  ExtensionInstalled,
  ExtensionUpgraded,
  ExtensionDeprecated,
  ExtensionUninstalled,
} from '../../generated/ColonyNetwork/IColonyNetwork'

import { handleEvent } from './event'
import { replaceFirst} from '../utils';

import { Colony, Domain } from '../../generated/schema'
import { Colony as ColonyTemplate, OneTxPayment as OneTxPaymentTemplate } from '../../generated/templates'

import { createToken } from './token'
import { IColonyNetwork as ColonyNetworkContract } from '../../generated/ColonyNetwork/IColonyNetwork'

export function handleColonyNetworkInitialised(event: ColonyNetworkInitialised): void {
  handleEvent("ColonyNetworkInitialised(address)", event, event.address)
}

export function handleTokenLockingAddressSet(event: TokenLockingAddressSet): void {
  handleEvent("TokenLockingAddressSet(address)", event, event.address)
}

export function handleMiningCycleResolverSet(event: MiningCycleResolverSet): void {
  handleEvent("MiningCycleResolverSet(address)", event, event.address)
}

export function handleNetworkFeeInverseSet(event: NetworkFeeInverseSet): void {
  handleEvent("NetworkFeeInverseSet(uint256)", event, event.address)
}

export function handleTokenWhitelisted(event: TokenWhitelisted): void {
  handleEvent("TokenWhitelisted(address,bool)", event, event.address)
}

export function handleColonyVersionAdded(event: ColonyVersionAdded): void {
  handleEvent("ColonyVersionAdded(version,address)", event, event.address)
}

export function handleMetaColonyCreated(event: MetaColonyCreated): void {
  handleEvent("MetaColonyCreated(address,address,uint256)", event, event.address)
}

export function handleColonyAdded(event: ColonyAdded): void {
  let rootDomain = new Domain(event.params.colonyAddress.toHex() + '_domain_1')
  rootDomain.domainChainId = new BigInt(1)
  rootDomain.metadata = ""
  rootDomain.save()

  let colony = Colony.load(event.params.colonyAddress.toHex())
  if (colony == null) {
    colony = new Colony(event.params.colonyAddress.toHexString())
    let colonyNetwork = ColonyNetworkContract.bind(Address.fromString(event.address.toHexString()))

    let ensName = colonyNetwork.try_lookupRegisteredENSDomain(Address.fromString(event.params.colonyAddress.toHexString()))
    if (ensName.reverted) {
      colony.ensName = null;
    } else {
      /*
       * @NOTE Don't change this line unless you've first checked the deploy scripts
       * Yes! They are correct!
       */
      colony.ensName = replaceFirst(ensName.value, 'colony.joincolony.eth', 'colony.joincolony.eth');
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

  handleEvent("ColonyAdded(indexed uint256,indexed address,address)", event, event.address)
}

export function handleSkillAdded(event: SkillAdded): void {
  handleEvent("SkillAdded(uint256,uint256)", event, event.address)
}

export function handleAuctionCreated(event: AuctionCreated): void {
  handleEvent("AuctionCreated(address,address,uint256)", event, event.address)
}

export function handleReputationMiningInitialised(event: ReputationMiningInitialised): void {
  handleEvent("ReputationMiningInitialised(address)", event, event.address)
}

export function handleReputationMiningCycleComplete(event: ReputationMiningCycleComplete): void {
  handleEvent("ReputationMiningCycleComplete(bytes32,uint256)", event, event.address)
}

export function handleReputationRootHashSet(event: ReputationRootHashSet): void {
  handleEvent("ReputationRootHashSet(bytes32,uint256,address[],uint256)", event, event.address)
}

export function handleUserLabelRegistered(event: UserLabelRegistered): void {
  handleEvent("UserLabelRegistered(indexed address,bytes32)", event, event.address)
}

export function handleColonyLabelRegistered(event: ColonyLabelRegistered): void {
  let colony = Colony.load(event.params.colony.toHexString())
  let colonyNetwork = ColonyNetworkContract.bind(Address.fromString(event.address.toHexString()))

  if (!colony.ensName) {
    let ensName = colonyNetwork.try_lookupRegisteredENSDomain(Address.fromString(event.params.colony.toHexString()))
    if (ensName.reverted) {
      colony.ensName = null;
    } else {
      /*
       * @NOTE Don't change this line unless you've first checked the deploy scripts
       * Yes! They are correct!
       */
      colony.ensName = replaceFirst(ensName.value, 'colony.joincolony.eth', 'colony.joincolony.eth');
    }
  }

  colony.save()

  handleEvent("ColonyLabelRegistered(address,bytes32)", event, event.address)
}

export function handleReputationMinerPenalised(event: ReputationMinerPenalised): void {
  handleEvent("ReputationMinerPenalised(address,uint256)", event, event.address)
}

export function handleExtensionAddedToNetwork(event: ExtensionAddedToNetwork): void {
  handleEvent("ExtensionAddedToNetwork(indexed bytes32,version)", event, event.address)
}

export function handleExtensionInstalled(event: ExtensionInstalled): void {
  let ONE_TX_PAYMENT = crypto.keccak256(ByteArray.fromUTF8("OneTxPayment")).toHexString()
  log.info("ExtensionInstalled event seen, {}, {}", [event.params.extensionId.toHexString(), ONE_TX_PAYMENT]);
  if (event.params.extensionId.toHexString() == ONE_TX_PAYMENT) {
    let cn = IColonyNetwork.bind(event.address);
    let extensionAddress = cn.getExtensionInstallation(<Bytes>ByteArray.fromHexString(ONE_TX_PAYMENT), event.params.colony)
    log.info("Adding extension at address {}", [extensionAddress.toHexString()]);

    OneTxPaymentTemplate.create(extensionAddress)

    handleEvent("ExtensionInstalled(indexed bytes32,indexed address,version)", event, event.address)
  }
}

export function handleExtensionUpgraded(event: ExtensionUpgraded): void {
  handleEvent("ExtensionUpgraded(indexed bytes32,indexed address,version)", event, event.address)
}

export function handleExtensionDeprecated(event: ExtensionDeprecated): void {
  handleEvent("ExtensionDeprecated(indexed bytes32,indexed address,bool)", event, event.address)
}

export function handleExtensionUninstalled(event: ExtensionUninstalled): void {
  handleEvent("ExtensionUninstalled(indexed bytes32,indexed address)", event, event.address)
}
