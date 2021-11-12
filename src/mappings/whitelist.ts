import {
  ExtensionInitialised,
  Whitelist as WhitelistContract,
} from '../../generated/templates/Whitelist/Whitelist'

import { handleEvent } from './event'

export function handleExtensionInitialised(event: ExtensionInitialised): void {
  let extension = WhitelistContract.bind(event.address);
  let colony = extension.getColony();

  handleEvent("ExtensionInitialised()", event, colony)
}
