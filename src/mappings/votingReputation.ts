import { BigInt } from '@graphprotocol/graph-ts'

import {
  MotionCreated,
  MotionStaked,
  MotionEscalated,
  ExtensionInitialised,
  VotingReputation as VotingReputationContract
} from '../../generated/templates/VotingReputation/VotingReputation'

import { Motion } from '../../generated/schema'

import { handleEvent } from './event'

export function handleExtensionInitialised(event: ExtensionInitialised): void {
  let extension = VotingReputationContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("ExtensionInitialised()", event, colony)
}

export function handleMotionCreated(event: MotionCreated): void {
  let extension = VotingReputationContract.bind(event.address);
  let colony = extension.getColony();

  let motionId = event.params.motionId;
  let chainMotion = extension.getMotion(motionId);

  let motion = new Motion(colony.toHexString() + "_motion_" + extension._address.toHexString() + '_' + motionId.toString());
  motion.fundamentalChainId = motionId
  motion.associatedColony = colony.toHexString()
  motion.extensionAddress = extension._address.toHexString()
  motion.transaction = event.transaction.hash.toHexString()
  motion.agent = event.params.creator.toHexString()
  motion.domain = colony.toHexString() + '_domain_' + event.params.domainId.toString()
  motion.currentStake = chainMotion.stakes.pop()
  motion.requiredStake = new BigInt(0)
  motion.escalated = chainMotion.escalated

  motion.save()

  handleEvent("MotionCreated(uint256,address,uint256)", event, colony)
}

export function handleMotionStaked(event: MotionStaked): void {
  let extension = VotingReputationContract.bind(event.address);
  let colony = extension.getColony();

  let motionId = event.params.motionId;
  let chainMotion = extension.getMotion(motionId);

  let motion = new Motion(colony.toHexString() + "_motion_" + extension._address.toHexString() + '_' + motionId.toString());
  motion.currentStake = chainMotion.stakes.pop()

  motion.save()

  handleEvent("MotionStaked(uint256,address,uint256,uint256)", event, colony)
}

export function handleMotionEscalated(event: MotionEscalated): void {
  let extension = VotingReputationContract.bind(event.address);
  let colony = extension.getColony();

  let motionId = event.params.motionId;
  let chainMotion = extension.getMotion(motionId);

  let motion = new Motion(colony.toHexString() + "_motion_" + extension._address.toHexString() + '_' + motionId.toString());
  motion.escalated = chainMotion.escalated

  motion.save()

  handleEvent("MotionEscalated(uint256,address,uint256,uint256)", event, colony)
}
