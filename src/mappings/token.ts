import { Address, BigInt } from '@graphprotocol/graph-ts'

import { Token as TokenContract } from '../../generated/templates/Token/Token'
import { Token } from '../../generated/templates/Token/Token'
import { Token as TokenSchema } from '../../generated/schema'

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
  }
}
