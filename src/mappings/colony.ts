import { log } from '@graphprotocol/graph-ts'

import {
  IColony,
  DomainAdded,
  DomainAdded1 as HistoricDomainAdded,
  DomainMetadata,
  PaymentAdded,
  PaymentPayoutSet,
  ColonyMetadata,
  TokensMinted,
  ColonyInitialised,
  ColonyBootstrapped,
  ColonyFundsClaimed,
  RewardPayoutCycleStarted,
  RewardPayoutCycleEnded,
  RewardPayoutClaimed,
  ColonyRewardInverseSet,
  ExpenditureAdded,
  ExpenditureTransferred,
  ExpenditureCancelled,
  ExpenditureFinalized,
  ExpenditureRecipientSet,
  ExpenditureSkillSet,
  ExpenditurePayoutSet,
  TaskAdded,
  TaskBriefSet,
  TaskDueDateSet,
  TaskSkillSet,
  TaskRoleUserSet,
  TaskPayoutSet,
  TaskChangedViaSignatures,
  TaskDeliverableSubmitted,
  TaskCompleted,
  TaskWorkRatingRevealed,
  TaskFinalized,
  PayoutClaimed,
  TaskCanceled,
  FundingPotAdded,
  Annotation,
  PaymentSkillSet,
  PaymentRecipientSet,
  PaymentFinalized,
  TokensBurned,
  ColonyFundsMovedBetweenFundingPots,
  ColonyRoleSet,
  ColonyUpgraded,
  ColonyUpgraded1 as HistoricColonyUpgraded,
  RecoveryModeEntered,
} from '../../generated/templates/Colony/IColony'

import {
  Colony,
  ColonyMetadata as ColonyMetadataInstance,
  Domain,
  DomainMetadata as DomainMetadataInstance,
  Payment,
  FundingPotPayout,
  FundingPot,
} from '../../generated/schema'

import { handleEvent } from './event'
import { createToken } from './token'

export function handleColonyInitialised(event: ColonyInitialised): void {
  handleEvent("ColonyInitialised(address,address,address)", event, event.address)
}

export function handleColonyBootstrapped(event: ColonyBootstrapped): void {
  handleEvent("ColonyBootstrapped(address,address[],int256[])", event, event.address)
}

export function handleColonyFundsClaimed(event: ColonyFundsClaimed): void {
  handleEvent("ColonyFundsClaimed(address,address,uint256,uint256)", event, event.address)
}

export function handleRewardPayoutCycleStarted(event: RewardPayoutCycleStarted): void {
  handleEvent("RewardPayoutCycleStarted(address,uint256)", event, event.address)
}

export function handleRewardPayoutCycleEnded(event: RewardPayoutCycleEnded): void {
  handleEvent("RewardPayoutCycleEnded(address,uint256)", event, event.address)
}

export function handleRewardPayoutClaimed(event: RewardPayoutClaimed): void {
  handleEvent("RewardPayoutClaimed(uint256,address,uint256,uint256)", event, event.address)
}

export function handleColonyRewardInverseSet(event: ColonyRewardInverseSet): void {
  handleEvent("ColonyRewardInverseSet(address,uint256)", event, event.address)
}

export function handleExpenditureAdded(event: ExpenditureAdded): void {
  handleEvent("ExpenditureAdded(address,uint256)", event, event.address)
}

export function handleExpenditureTransferred(event: ExpenditureTransferred): void {
  handleEvent("ExpenditureTransferred(address,uint256,address)", event, event.address)
}

export function handleExpenditureCancelled(event: ExpenditureCancelled): void {
  handleEvent("ExpenditureCancelled(address,uint256)", event, event.address)
}

export function handleExpenditureFinalized(event: ExpenditureFinalized): void {
  handleEvent("ExpenditureFinalized(address,uint256)", event, event.address)
}

export function handleExpenditureRecipientSet(event: ExpenditureRecipientSet): void {
  handleEvent("ExpenditureRecipientSet(address,uint256,uint256,address)", event, event.address)
}

export function handleExpenditureSkillSet(event: ExpenditureSkillSet): void {
  handleEvent("ExpenditureSkillSet(address,uint256,uint256,uint256)", event, event.address)
}

export function handleExpenditurePayoutSet(event: ExpenditurePayoutSet): void {
  handleEvent("ExpenditurePayoutSet(address,uint256,uint256,address,uint256)", event, event.address)
}

export function handlePaymentAdded(event: PaymentAdded): void {
  log.info("PaymentAdded event seen", [])
  let paymentGid = event.address.toHexString() + "_payment_" + event.params.paymentId.toString()
  let payment = Payment.load(paymentGid)
  if (payment == null) {
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

export function handleTaskAdded(event: TaskAdded): void {
  handleEvent("TaskAdded(address,uint256)", event, event.address)
}

export function handleTaskBriefSet(event: TaskBriefSet): void {
  handleEvent("TaskBriefSet(uint256,bytes32)", event, event.address)
}

export function handleTaskDueDateSet(event: TaskDueDateSet): void {
  handleEvent("TaskDueDateSet(uint256,uint256)", event, event.address)
}

export function handleTaskSkillSet(event: TaskSkillSet): void {
  handleEvent("TaskSkillSet(uint256,uint256)", event, event.address)
}

export function handleTaskRoleUserSet(event: TaskRoleUserSet): void {
  handleEvent("TaskRoleUserSet(uint256,uint8,address)", event, event.address)
}

export function handleTaskPayoutSet(event: TaskPayoutSet): void {
  handleEvent("TaskPayoutSet(uint256,uint8,address,uint256)", event, event.address)
}

export function handleTaskChangedViaSignatures(event: TaskChangedViaSignatures): void {
  handleEvent("TaskChangedViaSignatures(address[])", event, event.address)
}

export function handleTaskDeliverableSubmitted(event: TaskDeliverableSubmitted): void {
  handleEvent("TaskDeliverableSubmitted(address,uint256,bytes32)", event, event.address)
}

export function handleTaskCompleted(event: TaskCompleted): void {
  handleEvent("TaskCompleted(address,uint256)", event, event.address)
}

export function handleTaskWorkRatingRevealed(event: TaskWorkRatingRevealed): void {
  handleEvent("TaskWorkRatingRevealed(address,uint256,uint8,uint8)", event, event.address)
}

export function handleTaskFinalized(event: TaskFinalized): void {
  handleEvent("TaskFinalized(address,uint256)", event, event.address)
}

export function handleTokensMinted(event: TokensMinted): void {
  handleEvent("TokensMinted(address,address,uint256)", event, event.address)
}

export function handlePayoutClaimed(event: PayoutClaimed): void {
  handleEvent("PayoutClaimed(address,uint256,address,uint256)", event, event.address)
}

export function handleTaskCanceled(event: TaskCanceled): void {
  handleEvent("TaskCanceled(uint256)", event, event.address)
}

export function handleDomainAdded(event: DomainAdded): void {
  let domain = new Domain(event.address.toHex() + '_domain_' + event.params.domainId.toString())
  domain.domainChainId = event.params.domainId
  // The real way to get the parent would be to look at this
  // event.transaction.input.toHexString()
  // And extract the parent that way. But it causes a memory-access out-of-bounds error which
  // isn't really a good sign...
  domain.parent = event.address.toHex() + '_domain_1'
  domain.name = "Team #" + event.params.domainId.toString()
  if (event.params.domainId.toString() == '1') {
    domain.name = "Root"
    domain.parent = null
  }
  domain.colonyAddress = event.address.toHex()
  domain.save()

  handleEvent('DomainAdded(address,uint256)', event, event.address);
}

export function handleHistoricDomainAdded(event: HistoricDomainAdded): void {
  let domain = new Domain(event.address.toHex() + '_domain_' + event.params.domainId.toString())
  domain.domainChainId = event.params.domainId
  // The real way to get the parent would be to look at this
  // event.transaction.input.toHexString()
  // And extract the parent that way. But it causes a memory-access out-of-bounds error which
  // isn't really a good sign...
  domain.parent = event.address.toHex() + '_domain_1'
  domain.name = "Domain #" + event.params.domainId.toString()
  if (event.params.domainId.toString() == '1') {
    domain.name = "Root"
    domain.parent = null
  }
  domain.colonyAddress = event.address.toHex()
  domain.save()

  handleEvent('DomainAdded(address)', event, event.address);
}

export function handleDomainMetadata(event: DomainMetadata): void {
  let metadata = event.params.metadata.toString()
  let domain = new Domain(event.address.toHex() + '_domain_' + event.params.domainId.toString())
  domain.metadata = metadata

  let metadataHistory = new DomainMetadataInstance(
    event.address.toHex() +
    '_domain_' + event.params.domainId.toString() +
    '_metadata_' + metadata +
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

export function handleColonyMetadata(event: ColonyMetadata): void {
  let colony = Colony.load(event.address.toHexString())
  let metadata = event.params.metadata.toString()

  colony.metadata = metadata

  let metadataHistory = new ColonyMetadataInstance(
    event.address.toHex() +
    '_metadata_' + metadata +
    '_transaction_' + event.transaction.hash.toHexString() +
    '_log_' + event.logIndex.toString(),
  )

  metadataHistory.transaction = event.transaction.hash.toHexString()
  metadataHistory.colony = colony.id
  metadataHistory.metadata = metadata

  metadataHistory.save()
  colony.save()

  handleEvent("ColonyMetadata(address,string)", event, event.address)
}

export function handleFundingPotAdded(event: FundingPotAdded): void {
  handleEvent("FundingPotAdded(uint256)", event, event.address)
}

export function handleAnnotation(event: Annotation): void {
  handleEvent("Annotation(address,bytes32,string)", event, event.address)
}

export function handlePaymentPayoutSet(event: PaymentPayoutSet): void {
  let c = IColony.bind(event.address);
  let paymentInfo = c.getPayment(event.params.paymentId)
  let fundingPotChainId = paymentInfo.fundingPotId

  let fundingPotPayoutGid = event.address.toHexString() + "_fundingpot_" + fundingPotChainId.toString() + "_" + event.params.token.toHexString()
  let fundingPotPayout = FundingPotPayout.load(fundingPotPayoutGid);

  if (fundingPotPayout == null) {
    fundingPotPayout = new FundingPotPayout(fundingPotPayoutGid)
  }

  fundingPotPayout.fundingPotChainId = fundingPotChainId
  fundingPotPayout.amount = event.params.amount

  fundingPotPayout.token = event.params.token.toHexString()
  fundingPotPayout.save()

  let fundingPotGid = event.address.toHexString() + "_fundingpot_" + fundingPotChainId.toString()
  let fundingPot = FundingPot.load(fundingPotGid)
  if (fundingPot == null) {
    fundingPot = new FundingPot(fundingPotGid)
    fundingPot.fundingPotPayouts = [fundingPotPayoutGid]
  } else {
    if (fundingPot.fundingPotPayouts.indexOf(fundingPotPayoutGid) == -1) {
      fundingPot.fundingPotPayouts.push(fundingPotPayoutGid)
    }
  }
  fundingPot.save()

  createToken(fundingPotPayout.token)

  handleEvent("PaymentPayoutSet(address,uint256,address,uint256)", event, event.address)
}

export function handlePaymentSkillSet(event: PaymentSkillSet): void {
  handleEvent("PaymentSkillSet(address,uint256,uint256)", event, event.address)
}

export function handlePaymentRecipientSet(event: PaymentRecipientSet): void {
  handleEvent("PaymentRecipientSet(address,uint256,address)", event, event.address)
}

export function handlePaymentFinalized(event: PaymentFinalized): void {
  handleEvent("PaymentFinalized(address,uint256)", event, event.address)
}

export function handleTokensBurned(event: TokensBurned): void {
  handleEvent("TokensBurned(address,address,uint256)", event, event.address)
}

export function handleFundsMovedBetweenFundingPots(event: ColonyFundsMovedBetweenFundingPots): void {
  handleEvent("ColonyFundsMovedBetweenFundingPots(address,uint256,uint256,uint256,address)", event, event.address)
}

export function handleColonyRoleSet(event: ColonyRoleSet): void {
  handleEvent("ColonyRoleSet(address,address,uint256,uint8,bool)", event, event.address)
}

export function handleColonyUpgraded(event: ColonyUpgraded): void {
  handleEvent("ColonyUpgraded(address,uint256,uint256)", event, event.address)
}

export function handleHistoricColonyUpgraded(event: HistoricColonyUpgraded): void {
  handleEvent("ColonyUpgraded(uint256,uint256)", event, event.address)
}

export function handleRecoveryModeEntered(event: RecoveryModeEntered): void {
  handleEvent("RecoveryModeEntered(address)", event, event.address)
}
