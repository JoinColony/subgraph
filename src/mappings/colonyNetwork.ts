import { BigInt } from '@graphprotocol/graph-ts'

import {
  ColonyAdded,
} from '../../generated/ColonyNetwork/IColonyNetwork'

import { Colony, Domain } from '../../generated/schema'
import { Colony as ColonyTemplate } from '../../generated/templates'

export function handleColonyAdded(event: ColonyAdded): void {
  let rootDomain = new Domain(event.params.colonyAddress.toHex() + '_1')
  rootDomain.index = new BigInt(1)
  rootDomain.save()

  let colony = new Colony(event.params.colonyAddress.toHex())
  colony.index = event.params.colonyId
  colony.token = event.params.token.toHex()
  colony.domains = [rootDomain.id]
  colony.save()

  ColonyTemplate.create(event.params.colonyAddress)
}
