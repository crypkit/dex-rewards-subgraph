import {Address, BigInt} from "@graphprotocol/graph-ts"
import {Reward} from "../generated/schema";
import {RewardPaid, Staked, Withdrawn} from "../generated/UniStakingRewardsETH/DAI/StakingRewards";
import {DENOMINATION, saveSnapshot, updateStakePosition} from "./shared";
import {StakingRewards} from "../generated/IndexETH/DPI/StakingRewards";

function getPool(contractAddress: Address): Address {
    return StakingRewards.bind(contractAddress).stakingToken()
}

function getStakingService(poolAddress: Address | null): string {
    // TODO: using reward token address would be more generic, but it's unnecessary for now
    if (poolAddress == Address.fromString("0x4d5ef58aac27d99935e5b6b4a6778ff292059991")) {
        return "INDEX"
    }
    return "UNI_V2"
}

export function handleRewardPaid(event: RewardPaid): void {
    let id = event.params.user
        .toHexString()
        .concat('-')
        .concat(event.logIndex.toString())
    let pool = getPool(event.address)

    let reward = new Reward(id)
    reward.exchange = "UNI_V2"
    reward.stakingService = getStakingService(pool)
    reward.pool = pool
    reward.amount = event.params.reward.toBigDecimal().times(DENOMINATION)
    reward.user = event.params.user
    reward.transaction = event.transaction.hash
    reward.blockNumber = event.block.number
    reward.blockTimestamp = event.block.timestamp
    reward.save()
}

export function handleStaked(event: Staked): void {
    let pool = getPool(event.address)
    let user = event.params.user
    let id = pool
        .toHexString()
        .concat('-')
        .concat(user.toHexString())
    let stakePosition = updateStakePosition(id, pool, user, event.params.amount, "UNI_V2", getStakingService(pool))
    saveSnapshot(stakePosition, event)
}

export function handleWithdrawn(event: Withdrawn): void {
    let pool = getPool(event.address)
    let amount = event.params.amount.times(BigInt.fromI32(-1))
    let user = event.params.user
    let id = pool
        .toHexString()
        .concat('-')
        .concat(user.toHexString())
    let stakePosition = updateStakePosition(id, pool, user, amount, "UNI_V2", getStakingService(pool))
    saveSnapshot(stakePosition, event)
}