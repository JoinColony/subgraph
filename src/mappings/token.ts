import { Address, BigInt } from '@graphprotocol/graph-ts'

import {
  Token as TokenContract,
  Mint,
  Burn,
  LogSetAuthority,
  LogSetOwner,
  Approval,
  Transfer,
} from '../../generated/templates/Token/Token'
import { Token as TokenSchema } from '../../generated/schema'

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
  }
}

export function handleMint(event: Mint): void {
  handleEvent("Mint(address,uint256)", event, event.address)
}

export function handleBurn(event: Burn): void {
  handleEvent("Burn(address,uint256)", event, event.address)
}

export function handleLogSetAuthority(event: LogSetAuthority): void {
  handleEvent("LogSetAuthority(address)", event, event.address)
}

export function handleLogSetOwner(event: LogSetOwner): void {
  handleEvent("LogSetOwner(address)", event, event.address)
}

export function handleApproval(event: Approval): void {
  handleEvent("Approval(address,address,uint256)", event, event.address)
}

export function handleTransfer(event: Transfer): void {
  handleEvent("Transfer(address,address,uint256)", event, event.address)
}
