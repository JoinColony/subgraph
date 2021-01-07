import { BigInt, log, Address } from '@graphprotocol/graph-ts'

import { IColony, DomainAdded, PaymentAdded, PaymentPayoutSet, ColonyMetadata, TokensMinted } from '../../generated/templates/Colony/IColony'

import { Token as TokenContract } from '../../generated/templates/Token/Token'

import { Token, Colony, Domain, Payment, FundingPotPayout, FundingPot } from '../../generated/schema'

import { OneTxPayment, TokensMinted } from '../../generated/schema'

import { handleEvent } from './event'

export function handleDomainAdded(event: DomainAdded): void {
  let domain = new Domain(event.address.toHex() + '_domain_' +  event.params.domainId.toString())
  domain.domainChainId = event.params.domainId
  // The real way to get the parent would be to look at this
  // event.transaction.input.toHexString()
  // And extract the parent that way. But it causes a memory-access out-of-bounds error which
  // isn't really a good sign...
  domain.parent = event.address.toHex() + '_1'
  domain.name = "Domain #" + event.params.domainId.toString()
  domain.colonyAddress = event.address.toHex()
  domain.save()
}

export function handlePaymentPayoutSet(event: PaymentPayoutSet): void{
  let c = IColony.bind(event.address);
  let paymentInfo = c.getPayment(event.params.paymentId)
  let fundingPotChainId = paymentInfo.fundingPotId

  let fundingPotPayoutGid = event.address.toHexString() + "_fundingpot_" +  fundingPotChainId.toString() + "_" + event.params.token.toHexString()
  let fundingPotPayout = FundingPotPayout.load(fundingPotPayoutGid);

  if (fundingPotPayout == null){
    fundingPotPayout = new FundingPotPayout(fundingPotPayoutGid)
  }

  fundingPotPayout.fundingPotChainId = fundingPotChainId
  fundingPotPayout.amount = event.params.amount

  fundingPotPayout.token = event.params.token.toHexString()
  fundingPotPayout.save()

  let fundingPotGid = event.address.toHexString() + "_fundingpot_" + fundingPotChainId.toString()
  let fundingPot = FundingPot.load(fundingPotGid)
  if (fundingPot == null){
    fundingPot = new FundingPot(fundingPotGid)
    fundingPot.fundingPotPayouts = [fundingPotPayoutGid]
  } else {
    if (fundingPot.fundingPotPayouts.indexOf(fundingPotPayoutGid) == -1){
      fundingPot.fundingPotPayouts.push(fundingPotPayoutGid)
    }
  }
  fundingPot.save()

  let token = Token.load(fundingPotPayout.token)
  if (token == null){
    token = new Token(fundingPotPayout.token);
    let t = TokenContract.bind(Address.fromString(fundingPotPayout.token))

    let decimals = t.try_decimals()
    if (decimals.reverted){
      token.decimals = BigInt.fromI32(18)
    } else {
      token.decimals = BigInt.fromI32(decimals.value)
    }
    let symbol = t.try_symbol()
    if (!symbol.reverted){
      token.symbol = symbol.value
    }

    token.save()

  }
  handleEvent("PaymentPayoutSet(string,uint256,address,uint256)", event, event.address)
}

export function handlePaymentAdded(event: PaymentAdded): void {
  log.info("PaymentAdded event seen", [])
  let paymentGid = event.address.toHexString() + "_payment_" + event.params.paymentId.toString()
  let payment = Payment.load(paymentGid)
  if (payment == null){
    payment = new Payment(paymentGid)
  }
  let c = IColony.bind(event.address);
  let paymentInfo = c.getPayment(event.params.paymentId)
  payment.paymentChainId = event.params.paymentId
  payment.domain = event.address.toHex() + '_domain_' + paymentInfo.domainId.toString()
  payment.colony = event.address.toHexString()
  payment.to = paymentInfo.recipient.toHexString()
  payment.fundingPot = event.address.toHexString() + "_fundingpot_" + paymentInfo.fundingPotId.toString()
  payment.save()
  handleEvent("PaymentAdded(string,uint256)", event, event.address)
}

export function handleColonyMetadata(event: ColonyMetadata): void {
  let colony = Colony.load(event.address.toHexString())
  colony.metadata = event.params.metadata.toString()
  // NB you have to do this reassignment dance with arrays
  let metadataHistory = colony.metadataHistory
  metadataHistory.push(event.params.metadata.toString())
  colony.metadataHistory = metadataHistory
  colony.save()
  handleEvent("ColonyMetadata(string,string)", event, event.address)
}

export function handleTokensMinted(event: TokensMinted): void {
  const colony = Colony.load(event.address.toHexString())
  let tokensMintedGid =  colony.id + "_tokensminted_" + event.transaction.hash.toHexString() + "_" + event.log_index
  let tokensMinted = new TokensMinted(tokensMintedGid)
  tokensMinted.amount = event.params.amount
  tokensMinted.colony = colony.id
  tokensMinted.recipient = event.params.who
  tokensMinted.agent = event.params.agent
  tokensMinted.save()

  handleEvent("TokensMinted(address,address,uint256)", event, event.address)
}
