import {Address, BigInt} from "@graphprotocol/graph-ts/index";
import {Reward, StakePositionSnapshot} from "../generated/schema";
import {Deposit, Withdraw} from "../generated/MasterChef/MasterChef";
import {Transfer} from "../generated/SushiToken/ERC20";
import {DENOMINATION, updateStakePosition} from "./shared";
import {poolInfo} from "./poolInfo";

let masterChefAddress = Address.fromString("0xc2edad668740f1aa35e4d8f227fb8e17dca888cd")

export function handleDeposit(event: Deposit): void {
    let pid = event.params.pid.toI32()
    let poolAddress = Address.fromString(poolInfo[pid])
    let stakePosition = updateStakePosition(poolAddress, event.params.user, event.params.amount, "SUSHI")
    let snapshot = new StakePositionSnapshot(stakePosition.id.concat(event.logIndex.toString()))

    snapshot.exchange = stakePosition.exchange
    snapshot.user = stakePosition.user
    snapshot.pool = stakePosition.pool
    snapshot.liquidityTokenBalance = stakePosition.liquidityTokenBalance
    snapshot.blockNumber = event.block.number
    snapshot.blockTimestamp = event.block.timestamp
    snapshot.txHash = event.transaction.hash
    snapshot.txGasUsed = event.transaction.gasUsed
    snapshot.txGasPrice = event.transaction.gasPrice

    snapshot.save()
}

export function handleWithdraw(event: Withdraw): void {
    let pid = event.params.pid.toI32()
    let poolAddress = Address.fromString(poolInfo[pid])
    let amount = event.params.amount.times(BigInt.fromI32(-1))
    let stakePosition = updateStakePosition(poolAddress, event.params.user, amount, "SUSHI")
    let snapshot = new StakePositionSnapshot(stakePosition.id.concat(event.logIndex.toString()))

    snapshot.exchange = stakePosition.exchange
    snapshot.user = stakePosition.user
    snapshot.pool = stakePosition.pool
    snapshot.liquidityTokenBalance = stakePosition.liquidityTokenBalance
    snapshot.blockNumber = event.block.number
    snapshot.blockTimestamp = event.block.timestamp
    snapshot.txHash = event.transaction.hash
    snapshot.txGasUsed = event.transaction.gasUsed
    snapshot.txGasPrice = event.transaction.gasPrice

    snapshot.save()
}

export function handleTransfer(event: Transfer): void {
    if (event.params.from == masterChefAddress) {
        let id = event.params.to
            .toHexString()
            .concat('-')
            .concat(event.logIndex.toString())
        let reward = new Reward(id)
        reward.exchange = "SUSHI"
        reward.amount = event.params.value.toBigDecimal().times(DENOMINATION)
        reward.user = event.params.to
        reward.transaction = event.transaction.hash
        reward.blockNumber = event.block.number
        reward.blockTimestamp = event.block.timestamp
        reward.save()
    }
}