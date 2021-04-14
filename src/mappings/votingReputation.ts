import { log } from '@graphprotocol/graph-ts'

import {
  MotionCreated,
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
  motion.associatedColony = colony.toHexString()
  motion.transaction = event.transaction.hash.toHexString()
  motion.agent = event.params.creator.toHexString()
  motion.domain = colony.toHexString() + '_domain_' + event.params.domainId.toString()
  motion.state = extension.getMotionState(motionId)
  motion.stake = chainMotion.stakes.pop()
  motion.escalated = chainMotion.escalated

  motion.save()

  handleEvent("MotionCreated(uint256,address,uint256)", event, colony)
}
