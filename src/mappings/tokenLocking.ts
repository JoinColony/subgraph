import {
    UserTokenWithdrawn,
    UserTokenDeposited,
} from '../../generated/templates/TokenLocking/TokenLocking'

import { handleEvent } from './event'

export function handleUserTokenWithdrawn(event: UserTokenWithdrawn): void {
  handleEvent("UserTokenWithdrawn(address,address,uint256)", event, event.address)
}

export function handleUserTokenDeposited(event: UserTokenDeposited): void {
  handleEvent("UserTokenDeposited(address,address,uint256)", event, event.address)
}
