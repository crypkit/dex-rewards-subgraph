import {Address, BigInt} from "@graphprotocol/graph-ts/index";
import {Reward} from "../generated/schema";
import {Deposit, Withdraw} from "../generated/MasterChef/MasterChef";
import {Transfer} from "../generated/SushiToken/ERC20";
import {DENOMINATION, saveSnapshot, updateStakePosition} from "./shared";
import {poolInfo} from "./poolInfo";

let MASTER_CHEF_ADDRESS = Address.fromString("0xc2edad668740f1aa35e4d8f227fb8e17dca888cd")

export function handleDeposit(event: Deposit): void {
    let pid = event.params.pid.toI32()
    let poolAddress = Address.fromString(poolInfo[pid])
    let stakePosition = updateStakePosition(poolAddress, event.params.user, event.params.amount, "SUSHI")
    saveSnapshot(stakePosition, event)
}

export function handleWithdraw(event: Withdraw): void {
    let pid = event.params.pid.toI32()
    let poolAddress = Address.fromString(poolInfo[pid])
    let amount = event.params.amount.times(BigInt.fromI32(-1))
    let stakePosition = updateStakePosition(poolAddress, event.params.user, amount, "SUSHI")
    saveSnapshot(stakePosition, event)
}

export function handleTransfer(event: Transfer): void {
    if (event.params.from == MASTER_CHEF_ADDRESS) {
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