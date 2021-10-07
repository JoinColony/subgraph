import { Address, BigInt } from '@graphprotocol/graph-ts'

import {
  Token as TokenContract,
} from '../../generated/templates/Token/Token'
import {
  Token as TokenSchema,
  ColonyExtension as ColonyExtensionSchema,
} from '../../generated/schema'
import {
  Token as TokenTemplate
} from '../../generated/templates'

import {
  Transfer
} from '../../generated/templates/Token/Token'

import { handleEvent } from './event'

export function createToken(tokenAddress: string): void {
  let token = TokenSchema.load(tokenAddress)
  if (token == null) {
    token = new TokenSchema(tokenAddress)
    let t = TokenContract.bind(Address.fromString(tokenAddress))

    let decimals = t.try_decimals()
    if (decimals.reverted){
      token.decimals = BigInt.fromI32(18)
    } else {
      token.decimals = BigInt.fromI32(decimals.value)
    }
    let symbol = t.try_symbol()
    if (!symbol.reverted) {
      token.symbol = symbol.value
    }
    token.save()
    TokenTemplate.create(Address.fromString(tokenAddress))
  }
}

export function handleTransfer(event: Transfer): void {
  let extension = ColonyExtensionSchema.load(event.params.dst.toHexString());
  if (extension) {
    handleEvent("Transfer(address,address,uint256)", event, event.params.dst)
  }
}
