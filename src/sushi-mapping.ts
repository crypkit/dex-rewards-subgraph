import {Address, BigInt, log} from "@graphprotocol/graph-ts/index";
import {Reward} from "../generated/schema";
import {Deposit, MasterChef, Withdraw} from "../generated/MasterChef/MasterChef";
import {Transfer} from "../generated/SushiToken/ERC20";
import {DENOMINATION, saveSnapshot, updateStakePosition} from "./shared";
import {Pair as PairContract} from "../generated/MasterChef/Pair"

let MASTER_CHEF_ADDRESS = Address.fromString("0xc2edad668740f1aa35e4d8f227fb8e17dca888cd")
let UNISWAP_FACTORY = Address.fromString("0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f")

function getAddress(pid: BigInt): Address {
    let contract = MasterChef.bind(MASTER_CHEF_ADDRESS)
    return contract.poolInfo(pid).value0
}

function getExchange(pairAddress: Address): string {
    let contract = PairContract.bind(pairAddress)
    let factory = Address.fromHexString(contract.factory().toHexString())
    if (factory.equals(UNISWAP_FACTORY)) {
        return "UNI_V2"
    }
    return "SUSHI"
}

export function handleDeposit(event: Deposit): void {
    let poolAddress = getAddress(event.params.pid)
    let exchange = getExchange(poolAddress)
    // There is a lot of deposit calls with 0 amounts because users use this method to claim rewards
    if (!event.params.amount.equals(BigInt.fromI32(0))) {
        let stakePosition = updateStakePosition(poolAddress, event.params.user, event.params.amount, exchange, "SUSHI")
        saveSnapshot(stakePosition, event)
    }

    let id = event.transaction.hash.toHexString()
    let reward = Reward.load(id)
    if (reward !== null) {
        // This scenario occurs, when there was no reward paid out during deposit
        reward.pool = poolAddress
        reward.exchange = exchange
        reward.save()
    }
}

export function handleWithdraw(event: Withdraw): void {
    let poolAddress = getAddress(event.params.pid)
    let exchange = getExchange(poolAddress)
    let amount = event.params.amount.times(BigInt.fromI32(-1))
    let stakePosition = updateStakePosition(poolAddress, event.params.user, amount, exchange, "SUSHI")
    saveSnapshot(stakePosition, event)
    let id = event.transaction.hash.toHexString()
    let reward = Reward.load(id)
    if (reward !== null) {
        // This scenario occurs, when there was no reward paid out during deposit
        reward.pool = poolAddress
        reward.exchange = exchange
        reward.save();
    }
}

export function handleTransfer(event: Transfer): void {
    if (event.params.from == MASTER_CHEF_ADDRESS) {
        let id = event.transaction.hash.toHexString()
        if (Reward.load(id) !== null) {
            log.warning("Colliding rewards, id: ".concat(id), [])
        }
        let reward = new Reward(event.transaction.hash.toHexString())
        reward.exchange = "SUSHI"
        reward.stakingService = "SUSHI"
        reward.amount = event.params.value.toBigDecimal().times(DENOMINATION)
        reward.user = event.params.to
        reward.transaction = event.transaction.hash
        reward.blockNumber = event.block.number
        reward.blockTimestamp = event.block.timestamp
        reward.save()
    }
}