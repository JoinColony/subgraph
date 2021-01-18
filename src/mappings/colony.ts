import { log, Address } from '@graphprotocol/graph-ts'

import {
  IColony,
  DomainAdded,
  DomainMetadata,
  PaymentAdded,
  PaymentPayoutSet,
  ColonyMetadata,
  TokensMinted,
} from '../../generated/templates/Colony/IColony'

import {
  Colony,
  Domain,
  DomainMetadata as DomainMetadataInstance,
  Payment,
  FundingPotPayout,
  FundingPot,
} from '../../generated/schema'

import { handleEvent } from './event'
import { createToken } from './token'

export function handleDomainAdded(event: DomainAdded): void {
  let domain = new Domain(event.address.toHex() + '_domain_' +  event.params.domainId.toString())
  domain.domainChainId = event.params.domainId
  // The real way to get the parent would be to look at this
  // event.transaction.input.toHexString()
  // And extract the parent that way. But it causes a memory-access out-of-bounds error which
  // isn't really a good sign...
  domain.parent = event.address.toHex() + '_domain_1'
  domain.name = "Domain #" + event.params.domainId.toString()
  domain.colonyAddress = event.address.toHex()
  domain.save()
}

export function handleDomainMetadata(event: DomainMetadata): void {
  let metadata = event.params.metadata.toString()
  let domain = new Domain(event.address.toHex() + '_domain_' + event.params.domainId.toString())
  domain.metadata = metadata

  let metadataHistory = new DomainMetadataInstance(
    event.address.toHex() +
    '_domain_' + event.params.domainId.toString() +
    '_transaction_' + event.transaction.hash.toHexString() +
    '_log_' + event.logIndex.toString(),
  )
  metadataHistory.transaction = event.transaction.hash.toHexString()
  metadataHistory.domain = domain.id
  metadataHistory.metadata = metadata

  metadataHistory.save()
  domain.save()

  handleEvent("DomainMetadata(address,uint256,string)", event, event.address)
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

  createToken(fundingPotPayout.token)

  handleEvent("PaymentPayoutSet(address,uint256,address,uint256)", event, event.address)
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
  handleEvent("PaymentAdded(address,uint256)", event, event.address)
}

export function handleColonyMetadata(event: ColonyMetadata): void {
  let colony = Colony.load(event.address.toHexString())
  colony.metadata = event.params.metadata.toString()
  // NB you have to do this reassignment dance with arrays
  let metadataHistory = colony.metadataHistory
  metadataHistory.push(event.params.metadata.toString())
  colony.metadataHistory = metadataHistory
  colony.save()
  handleEvent("ColonyMetadata(address,string)", event, event.address)
}

export function handleTokensMinted(event: TokensMinted): void {
  handleEvent("TokensMinted(address,address,uint256)", event, event.address)
}
