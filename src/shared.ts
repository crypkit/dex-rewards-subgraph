import {Address, BigDecimal, BigInt, ethereum, log} from "@graphprotocol/graph-ts/index";
import {StakePosition, StakePositionSnapshot} from "../generated/schema";


// The coefficient by which I have to multiply to get the basic units of UNI, SUSHI and LP tokens
let DENOMINATION = BigDecimal.fromString("0.000000000000000001")

function updateStakePosition(positionId: string, poolAddress: Address, user: Address, balanceChange: BigInt, exchange: string, stakingService: string): StakePosition {
    let stakePosition = StakePosition.load(positionId)
    let balanceChange_ = balanceChange.toBigDecimal().times(DENOMINATION)
    if (stakePosition === null) {
        if (balanceChange <= BigInt.fromI32(0)) {
            // User called deposit method with 0 amount
            log.error("Non-positive balance change on stakePosition creation, id: "
                .concat(positionId).concat(", balance change: ").concat(balanceChange_.toString()), [])
        }
        stakePosition = new StakePosition(positionId)
        stakePosition.exchange = exchange
        stakePosition.stakingService = stakingService
        stakePosition.user = user
        stakePosition.pool = poolAddress
        stakePosition.liquidityTokenBalance = balanceChange_
    } else {
        // The follwing 2 lines are here, because of migrations in Sushi
        // (the 2 parameters can change for the same user position)
        stakePosition.exchange = exchange
        stakePosition.pool = poolAddress
        stakePosition.liquidityTokenBalance = stakePosition.liquidityTokenBalance.plus(balanceChange_)
    }
    stakePosition.save()
    return stakePosition as StakePosition
}

function saveSnapshot(stakePosition: StakePosition, event: ethereum.Event): void {
    let snapshot = new StakePositionSnapshot(stakePosition.id.concat(event.logIndex.toString()))

    snapshot.exchange = stakePosition.exchange
    snapshot.stakingService = stakePosition.stakingService
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