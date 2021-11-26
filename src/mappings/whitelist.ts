import {
  ExtensionInitialised,
  Whitelist as WhitelistContract,
  UserApproved as UserApprovedEvent,
  AgreementSigned as AgreementSignedEvent,
} from '../../generated/templates/Whitelist/Whitelist'

import { handleEvent } from './event'

export function handleExtensionInitialised(event: ExtensionInitialised): void {
  let extension = WhitelistContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("ExtensionInitialised()", event, colony)
}

export function handleUserApproved(event: UserApprovedEvent): void {
  let extension = WhitelistContract.bind(event.address);
  let colony = extension.getColony();
  handleEvent("UserApproved(address,bool)", event, colony)
}

export function handleAgreementSigned(event: AgreementSignedEvent): void {
  let extension = WhitelistContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("AgreementSigned(address)", event, colony)
}
