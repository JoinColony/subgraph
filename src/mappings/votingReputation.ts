import { BigInt } from '@graphprotocol/graph-ts'

import {
  ExtensionInitialised,
  MotionCreated,
  MotionStaked,
  MotionVoteSubmitted,
  MotionVoteRevealed,
  MotionEscalated,
  MotionFinalized,
  MotionRewardClaimed,
  MotionEventSet,
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
  let totalStakeFraction = extension.getTotalStakeFraction();

  let motion = new Motion(colony.toHexString() + "_motion_" + extension._address.toHexString() + '_' + motionId.toString());
  motion.fundamentalChainId = motionId
  motion.action = chainMotion.action.toHexString()
  motion.associatedColony = colony.toHexString()
  motion.extensionAddress = extension._address.toHexString()
  motion.transaction = event.transaction.hash.toHexString()
  motion.agent = event.params.creator.toHexString()
  motion.domain = colony.toHexString() + '_domain_' + event.params.domainId.toString()
  motion.stakes = chainMotion.stakes;
  motion.requiredStake = chainMotion.skillRep.times(totalStakeFraction).div(BigInt.fromI32(10).pow(18))
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
  motion.stakes = chainMotion.stakes;

  motion.save()

  handleEvent("MotionStaked(uint256,address,uint256,uint256)", event, colony)
}

export function handleMotionVoteSubmitted(event: MotionVoteSubmitted): void {
  let extension = VotingReputationContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("MotionVoteSubmitted(uint256,address)", event, colony)
}

export function handleMotionVoteRevealed(event: MotionVoteRevealed): void {
  let extension = VotingReputationContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("MotionVoteRevealed(uint256,address,uint256)", event, colony)
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

export function handleMotionFinalized(event: MotionFinalized): void {
  let extension = VotingReputationContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("MotionFinalized(uint256,bytes,bool)", event, colony)
}

export function handleMotionRewardClaimed(event: MotionRewardClaimed): void {
  let extension = VotingReputationContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("MotionRewardClaimed(uint256,address,uint256,uint256)", event, colony)
}

export function handleMotionEventSet(event: MotionEventSet): void {
  let extension = VotingReputationContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("MotionEventSet(uint256,uint256)", event, colony)
}
