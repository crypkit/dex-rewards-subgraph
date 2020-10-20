import {Address, log} from "@graphprotocol/graph-ts"
import {Reward, StakedEvent, WithdrawnEvent} from "../generated/schema";
import {
    RewardPaid,
    Staked,
    Withdrawn
} from "../generated/UniStakingRewards/StakingRewards";


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
    log.warning("Unknown pool address", []);
    return null
}

export function handleRewardPaid(event: RewardPaid): void {
    let reward = new Reward(event.params.user.toHexString() + "-" + event.logIndex.toString())
    reward.exchange = "UNI_V2"
    reward.pool = getPool(event.transaction.to)
    reward.amount = event.params.reward
    reward.user = event.params.user
    reward.transaction = event.transaction.hash
    reward.blockNumber = event.block.number
    reward.blockTimestamp = event.block.timestamp
    reward.save()
}

export function handleStaked(event: Staked): void {
    let staked = new StakedEvent(event.params.user.toHexString() + "-" + event.logIndex.toString())
    staked.exchange = "UNI_V2"
    staked.pool = getPool(event.transaction.to)
    staked.amount = event.params.amount
    staked.user = event.params.user
    staked.transaction = event.transaction.hash
    staked.blockNumber = event.block.number
    staked.blockTimestamp = event.block.timestamp
    staked.save()
}

export function handleWithdrawn(event: Withdrawn): void {
    let withdrawn = new WithdrawnEvent(event.params.user.toHexString() + "-" + event.logIndex.toString())
    withdrawn.exchange = "UNI_V2"
    withdrawn.pool = getPool(event.transaction.to)
    withdrawn.amount = event.params.amount
    withdrawn.user = event.params.user
    withdrawn.transaction = event.transaction.hash
    withdrawn.blockNumber = event.block.number
    withdrawn.blockTimestamp = event.block.timestamp
    withdrawn.save()
}


