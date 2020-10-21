import {Address, BigDecimal, BigInt, log} from "@graphprotocol/graph-ts"
import {
    Reward,
    StakePosition,
    StakePositionSnapshot
} from "../generated/schema";
import {
    RewardPaid,
    Staked,
    Withdrawn
} from "../generated/UniStakingRewards/StakingRewards";


// The coefficient by which I have to multiply to get the basic units of UNI and LP tokens
let DENOMINATION = BigDecimal.fromString("0.000000000000000001")

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
    let id = event.params.user
        .toHexString()
        .concat('-')
        .concat(event.logIndex.toString())
    let reward = new Reward(id)
    reward.exchange = "UNI_V2"
    reward.pool = getPool(event.transaction.to)
    reward.amount = event.params.reward.toBigDecimal().times(DENOMINATION)
    reward.user = event.params.user
    reward.transaction = event.transaction.hash
    reward.blockNumber = event.block.number
    reward.blockTimestamp = event.block.timestamp
    reward.save()
}

export function handleStaked(event: Staked): void {
    let poolId = <Address>getPool(event.transaction.to)
    let stakePosition = updateStakePosition(poolId, event.params.user, event.params.amount)
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

export function handleWithdrawn(event: Withdrawn): void {
    let poolId = <Address>getPool(event.transaction.to)
    let amount = event.params.amount.times(BigInt.fromI32(-1))
    let stakePosition = updateStakePosition(poolId, event.params.user, amount)
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

function updateStakePosition(poolId: Address, user: Address, balanceChange: BigInt): StakePosition {
    let id = poolId
        .toHexString()
        .concat('-')
        .concat(user.toHexString())
    let stakePosition = StakePosition.load(id)
    let convertedBalance = balanceChange.toBigDecimal()
    let balanceChange_ = convertedBalance.times(DENOMINATION)
    if (stakePosition === null) {
        if (balanceChange <= BigInt.fromI32(0)) {
            log.error("Negative balance change on stakePosition creation", [])
        }
        stakePosition = new StakePosition(id)
        stakePosition.exchange = "UNI_V2"
        stakePosition.user = user
        stakePosition.pool = poolId
        stakePosition.liquidityTokenBalance = balanceChange_
    } else {
        stakePosition.liquidityTokenBalance = stakePosition.liquidityTokenBalance.plus(balanceChange_)
    }
    stakePosition.save()
    return stakePosition as StakePosition
}

