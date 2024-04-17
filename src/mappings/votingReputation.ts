import { BigInt, Address, ethereum } from '@graphprotocol/graph-ts'

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
  VotingReputation as VotingReputationContract,
  VotingReputation__getMotionResult_motionStruct
} from '../../generated/templates/VotingReputation/VotingReputation'

import {
  VotingReputationV9 as VotingReputationV9Contract,
  VotingReputationV9__getMotionResult_motionStruct
} from '../../generated/templates/VotingReputation/VotingReputationV9'

import { Motion } from '../../generated/schema'

import { handleEvent } from './event'

export function handleExtensionInitialised(event: ExtensionInitialised): void {
  let extension = VotingReputationContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("ExtensionInitialised()", event, colony)
}

export function getChainMotion(extensionAddress: Address, motionId: BigInt): VotingReputation__getMotionResult_motionStruct {
  let e = VotingReputationContract.bind(extensionAddress);
  let colony = e.getColony();
  let version = e.version();

  if (version <= BigInt.fromI32(9)) {
    let e = VotingReputationV9Contract.bind(extensionAddress);
    let m = e.getMotion(motionId);

    let tupleArray: Array<ethereum.Value> = [
      ethereum.Value.fromUnsignedBigIntArray(m.events),
      ethereum.Value.fromBytes(m.rootHash),
      ethereum.Value.fromUnsignedBigInt(m.domainId),
      ethereum.Value.fromUnsignedBigInt(m.skillId),
      ethereum.Value.fromUnsignedBigInt(m.skillRep),
      ethereum.Value.fromUnsignedBigInt(m.repSubmitted),
      ethereum.Value.fromUnsignedBigInt(m.paidVoterComp),
      ethereum.Value.fromUnsignedBigIntArray(m.pastVoterComp),
      ethereum.Value.fromUnsignedBigIntArray(m.stakes),
      ethereum.Value.fromUnsignedBigIntArray(m.votes),
      ethereum.Value.fromBoolean(m.escalated),
      ethereum.Value.fromBoolean(m.finalized),
      ethereum.Value.fromAddress(m.altTarget),
      ethereum.Value.fromI32(0), // This is the new property, which is 0 (unset) for old motions
      ethereum.Value.fromBytes(m.action)
    ];

    let tuple = tupleArray as ethereum.Tuple;
    return tuple as VotingReputation__getMotionResult_motionStruct;

  } else {
    return e.getMotion(motionId);
  }
}

export function handleMotionCreated(event: MotionCreated): void {
  let extension = VotingReputationContract.bind(event.address);
  let colony = extension.getColony();

  let motionId = event.params.motionId;

  let chainMotion = getChainMotion(extension._address, motionId);

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
  motion.timestamp = event.block.timestamp

  motion.save()

  handleEvent("MotionCreated(uint256,address,uint256)", event, colony)
}

export function handleMotionStaked(event: MotionStaked): void {
  let extension = VotingReputationContract.bind(event.address);
  let colony = extension.getColony();

  let motionId = event.params.motionId;
  let chainMotion = getChainMotion(event.address, motionId);

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
  let chainMotion = getChainMotion(extension._address, motionId);

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
