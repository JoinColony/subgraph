import { BigInt, log } from '@graphprotocol/graph-ts'

import { DomainAdded } from '../../generated/templates/Colony/IColony'

import { Colony, Domain } from '../../generated/schema'

export function handleDomainAdded(event: DomainAdded): void {
  let domain = new Domain(event.address.toHex() + '_' + event.params.domainId.toString())
  domain.index = event.params.domainId
  // The real way to get the parent would be to look at this
  // event.transaction.input.toHexString()
  // And extract the parent that way. But it causes a memory-access out-of-bounds error which
  // isn't really a good sign...
  domain.parent = event.address.toHex() + '_1'
  domain.name = "Domain #" + event.params.domainId.toString()
  domain.colonyAddress = event.address.toHex()
  domain.save()
}
