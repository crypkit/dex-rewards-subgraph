import {Address, BigInt, log} from "@graphprotocol/graph-ts"
import {Reward} from "../generated/schema";
import {RewardPaid, Staked, Withdrawn} from "../generated/UniStakingRewardsETH/DAI/StakingRewards";
import {DENOMINATION, saveSnapshot, updateStakePosition} from "./shared";


// For some reason I could not get map working properly, so I am using this function
// as a workaround
function getPool(address: Address | null): Address | null {
    if (address == Address.fromString("0xca35e32e7926b96a9988f61d510e038108d8068e")) {
        return Address.fromString("0xbb2b8038a1640196fbe3e38816f3e67cba72d940")
    }
    if (address == Address.fromString("0x7fba4b8dc5e7616e59622806932dbea72537a56b")) {
        return Address.fromString("0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc")
    }
    if (address == Address.fromString("0x6c3e4cb2e96b01f4b866965a91ed4437839a121a")) {
        return Address.fromString("0x0d4a11d5eeaac28ec3f61d100daf4d40471f1852")
    }
    if (address == Address.fromString("0xa1484c3aa22a66c62b77e0ae78e15258bd0cb711")) {
        return Address.fromString("0xa478c2975ab1ea89e8196811f51a7b7ade33eb11")
    }
    if (address == Address.fromString("0x8f06fba4684b5e0988f215a47775bb611af0f986")) {
        return Address.fromString("0x4d5ef58aac27d99935e5b6b4a6778ff292059991")
    }
    log.error("Unknown pool address", []);
    return null
}

function getStakingService(address: Address | null): string {
    if (address == Address.fromString("0x8f06fba4684b5e0988f215a47775bb611af0f986")) {
        return "INDEX"
    }
    return "UNI_V2"
}

export function handleRewardPaid(event: RewardPaid): void {
    let id = event.params.user
        .toHexString()
        .concat('-')
        .concat(event.logIndex.toString())
    let reward = new Reward(id)
    reward.exchange = "UNI_V2"
    reward.stakingService = getStakingService(event.address)
    reward.pool = getPool(event.address)
    reward.amount = event.params.reward.toBigDecimal().times(DENOMINATION)
    reward.user = event.params.user
    reward.transaction = event.transaction.hash
    reward.blockNumber = event.block.number
    reward.blockTimestamp = event.block.timestamp
    reward.save()
}

export function handleStaked(event: Staked): void {
    let poolAddress = <Address>getPool(event.address)
    let user = event.params.user
    let id = poolAddress
        .toHexString()
        .concat('-')
        .concat(user.toHexString())
    let stakePosition = updateStakePosition(id, poolAddress, user, event.params.amount, "UNI_V2", getStakingService(event.address))
    saveSnapshot(stakePosition, event)
}

export function handleWithdrawn(event: Withdrawn): void {
    let poolAddress = <Address>getPool(event.address)
    let amount = event.params.amount.times(BigInt.fromI32(-1))
    let user = event.params.user
    let id = poolAddress
        .toHexString()
        .concat('-')
        .concat(user.toHexString())
    let stakePosition = updateStakePosition(id, poolAddress, user, amount, "UNI_V2", getStakingService(event.address))
    saveSnapshot(stakePosition, event)
}