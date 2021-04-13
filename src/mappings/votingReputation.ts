import {
  MotionCreated,
  ExtensionInitialised,
  VotingReputation as VotingReputationContract
} from '../../generated/templates/VotingReputation/VotingReputation'

import { log } from '@graphprotocol/graph-ts'

import { handleEvent } from './event'

export function handleExtensionInitialised(event: ExtensionInitialised): void {
  let extension = VotingReputationContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("ExtensionInitialised()", event, colony)
}

export function handleMotionCreated(event: MotionCreated): void {
  let extension = VotingReputationContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("MotionCreated(uint256,address,uint256)", event, colony)
}
