import {Address, BigDecimal, BigInt, log} from "@graphprotocol/graph-ts/index";
import {StakePosition} from "../generated/schema";

// The coefficient by which I have to multiply to get the basic units of UNI, SUSHI and LP tokens
let DENOMINATION = BigDecimal.fromString("0.000000000000000001")

function updateStakePosition(poolId: Address, user: Address, balanceChange: BigInt, exchange: string): StakePosition {
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
        stakePosition.exchange = exchange
        stakePosition.user = user
        stakePosition.pool = poolId
        stakePosition.liquidityTokenBalance = balanceChange_
    } else {
        stakePosition.liquidityTokenBalance = stakePosition.liquidityTokenBalance.plus(balanceChange_)
    }
    stakePosition.save()
    return stakePosition as StakePosition
}

export {DENOMINATION, updateStakePosition}