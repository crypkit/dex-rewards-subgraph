import {Address, BigInt, log} from "@graphprotocol/graph-ts/index";
import {Reward, SushiTxPoolMap} from "../generated/schema";
import {Deposit, Withdraw} from "../generated/MasterChef/MasterChef";
import {Transfer} from "../generated/SushiToken/ERC20";
import {DENOMINATION, saveSnapshot, updateStakePosition} from "./shared";
import {poolInfo} from "./poolInfo";

let MASTER_CHEF_ADDRESS = Address.fromString("0xc2edad668740f1aa35e4d8f227fb8e17dca888cd")

export function handleDeposit(event: Deposit): void {
    let pid = event.params.pid.toI32()
    let poolAddress = Address.fromString(poolInfo[pid])
    // There is a lot of deposit calls with 0 amounts because users use this method to claim rewards
    if (!event.params.amount.equals(BigInt.fromI32(0))) {
        let stakePosition = updateStakePosition(poolAddress, event.params.user, event.params.amount, "SUSHI")
        saveSnapshot(stakePosition, event)
    }

    let mapId = event.transaction.hash.toHexString()
    let sushiTxPoolMap = SushiTxPoolMap.load(mapId)
    if (sushiTxPoolMap === null) {
        sushiTxPoolMap = new SushiTxPoolMap(mapId)
    } else if (sushiTxPoolMap.pool != poolAddress) {
        log.warning("Multiple deposits to different pools in 1 tx - map id collision. Tx hash: "
            .concat(mapId)
            .concat(", original map's pool address: ")
            .concat(sushiTxPoolMap.pool.toHexString())
            .concat(", new address: ")
            .concat(poolAddress.toHexString()), [])
    }
    sushiTxPoolMap.pool = poolAddress
    sushiTxPoolMap.save()
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