import { BigInt, crypto, ByteArray, Address } from '@graphprotocol/graph-ts'

import {
  IColonyNetwork,
  ColonyAdded,
  ColonyLabelRegistered,
  ExtensionInstalled,
  ExtensionUninstalled,
  ExtensionDeprecated,
  ExtensionUpgraded,
  ExtensionAddedToNetwork,
  SkillAdded,
} from '../../generated/ColonyNetwork/IColonyNetwork'

import { handleEvent } from './event'
import { replaceFirst} from '../utils';

import { Colony, Domain, ColonyExtension, GlobalSkill } from '../../generated/schema'
import {
  Colony as ColonyTemplate,
  OneTxPayment as OneTxPaymentTemplate,
  CoinMachine as CoinMachineTemplate,
  VotingReputation as VotingReputationTemplate,
  Whitelist as WhitelistTemplate,
} from '../../generated/templates'

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
}

export function handleExtensionInstalled(event: ExtensionInstalled): void {
  let ONE_TX_PAYMENT = crypto.keccak256(ByteArray.fromUTF8("OneTxPayment")).toHexString()
  let COIN_MACHINE = crypto.keccak256(ByteArray.fromUTF8("CoinMachine")).toHexString()
  let VOTING_REPUTATION = crypto.keccak256(ByteArray.fromUTF8("VotingReputation")).toHexString()
  let WHITELIST = crypto.keccak256(ByteArray.fromUTF8("Whitelist")).toHexString()

  let cn = IColonyNetwork.bind(event.address)
  let colony = Colony.load(event.params.colony.toHexString())
  let extensionAddress = cn.getExtensionInstallation(event.params.extensionId, event.params.colony)

  let extension = new ColonyExtension(extensionAddress.toHexString())

  extension.hash = event.params.extensionId.toHexString()
  extension.colony = colony.id

  if (event.params.extensionId.toHexString() == ONE_TX_PAYMENT) {
    OneTxPaymentTemplate.create(extensionAddress)
  }

  if (event.params.extensionId.toHexString() == COIN_MACHINE) {
    CoinMachineTemplate.create(extensionAddress);
  }

  if (event.params.extensionId.toHexString() == VOTING_REPUTATION) {
    VotingReputationTemplate.create(extensionAddress)
  }

  if (event.params.extensionId.toHexString() == WHITELIST) {
    WhitelistTemplate.create(extensionAddress)
  }

  handleEvent("ExtensionInstalled(bytes32,address,version)", event, event.params.colony)

  extension.save()
  colony.save()
}

export function handleExtensionUninstalled(event: ExtensionUninstalled): void {
  handleEvent("ExtensionUninstalled(bytes32,address)", event, event.params.colony)
}

export function handleExtensionDeprecated(event: ExtensionDeprecated): void {
  handleEvent("ExtensionDeprecated(bytes32,address,bool)", event, event.params.colony)
}

export function handleExtensionUpgraded(event: ExtensionUpgraded): void {
  handleEvent("ExtensionUpgraded(bytes32,address,uint256)", event, event.params.colony)
}

export function handleExtensionAddedToNetwork(event: ExtensionAddedToNetwork): void {
  let cn = IColonyNetwork.bind(event.address)
  let extensionResolver = cn.getExtensionResolver(event.params.extensionId, event.params.version)

  handleEvent("ExtensionAddedToNetwork(bytes32,uint256)", event, extensionResolver)
}

export function handleSkillAdded(event: SkillAdded): void {
  let parentSkillId = 'global_skill_' + event.params.parentSkillId.toString()
  let skillId = 'global_skill_' + event.params.skillId.toString()

  let parentSkill = GlobalSkill.load(parentSkillId)
  if (parentSkill == null) {
    parentSkill = new GlobalSkill(parentSkillId)
    parentSkill.domainIds = []
    parentSkill.skillChainId = event.params.parentSkillId
  }
  parentSkill.save()

  let skill = GlobalSkill.load(skillId)
  if (skill == null) {
    skill = new GlobalSkill(skillId)
    skill.domainIds = []
    skill.skillChainId = event.params.skillId
  }
  skill.parent = parentSkillId
  skill.save()

  handleEvent("SkillAdded(uint256,uint256)", event, event.address)
}
