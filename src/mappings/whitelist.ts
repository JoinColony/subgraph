import {
  ExtensionInitialised,
  Whitelist as WhitelistContract,
  UserApproved as UserApprovedEvent,
} from '../../generated/templates/Whitelist/Whitelist'

import { KYCAddress } from '../../generated/schema'

import { handleEvent } from './event'

export function handleExtensionInitialised(event: ExtensionInitialised): void {
  let extension = WhitelistContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("ExtensionInitialised()", event, colony)
}

export function handleUserApproved(event: UserApprovedEvent): void {
  let extension = WhitelistContract.bind(event.address);
  let colony = extension.getColony();

  let kycAddress = KYCAddress.load(event.params._user.toHexString())
  if (kycAddress == null) {
    kycAddress = new KYCAddress(event.params._user.toHexString())

    kycAddress.extension = event.address.toHexString()
  }

  kycAddress.status = event.params._status

  kycAddress.save()

  handleEvent("UserApproved(address,bool)", event, colony)
}
