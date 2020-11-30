import {Address, BigDecimal, BigInt, ethereum, log} from "@graphprotocol/graph-ts/index";
import {StakePosition, StakePositionSnapshot} from "../generated/schema";


// The coefficient by which I have to multiply to get the basic units of UNI, SUSHI and LP tokens
let DENOMINATION = BigDecimal.fromString("0.000000000000000001")

function updateStakePosition(poolAddress: Address, user: Address, balanceChange: BigInt, exchange: string): StakePosition {
    let id = poolAddress
        .toHexString()
        .concat('-')
        .concat(user.toHexString())
    let stakePosition = StakePosition.load(id)
    let balanceChange_ = balanceChange.toBigDecimal().times(DENOMINATION)
    if (stakePosition === null) {
        if (balanceChange <= BigInt.fromI32(0)) {
            log.error("Negative balance change on stakePosition creation", [])
        }
        stakePosition = new StakePosition(id)
        stakePosition.exchange = exchange
        stakePosition.user = user
        stakePosition.pool = poolAddress
        stakePosition.liquidityTokenBalance = balanceChange_
    } else {
        stakePosition.liquidityTokenBalance = stakePosition.liquidityTokenBalance.plus(balanceChange_)
    }
    stakePosition.save()
    return stakePosition as StakePosition
}

function saveSnapshot(stakePosition: StakePosition, event: ethereum.Event): void {
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

export {DENOMINATION, updateStakePosition, saveSnapshot}