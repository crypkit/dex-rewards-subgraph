import {Address} from "@graphprotocol/graph-ts"
import {Transfer} from "../generated/BalTokenContract/ERC20";
import {Reward} from "../generated/schema";
import {BigDecimal} from "@graphprotocol/graph-ts/index";
import {Claimed} from "../generated/BalMerkleRedeem/MerkleRedeem";

let txOriginator = Address.fromString("0xcb3d284995e2ed50f8e9971718f2166a95ff83c2")
let disperseApp = Address.fromString("0xd152f549545093347a162dce210e7293f1452150")

// The coefficient by which I have to multiply to get the basic units of UNI and LP tokens
let DENOMINATION = BigDecimal.fromString("0.000000000000000001")

export function handleTransfer(event: Transfer): void {
    if (event.transaction.from == txOriginator && event.params.from == disperseApp) {
        // Filter for events which were emitted in a tx originating from
        // BAL team and the event's from address has to point to Disperse.app
        let id = event.params.to
            .toHexString()
            .concat('-')
            .concat(event.logIndex.toString())
        let reward = new Reward(id)
        reward.exchange = "BALANCER"
        reward.amount = event.params.value.toBigDecimal().times(DENOMINATION)
        reward.user = event.params.to
        reward.transaction = event.transaction.hash
        reward.blockNumber = event.block.number
        reward.blockTimestamp = event.block.timestamp
        reward.save()
    }
}

export function handleClaimed(event: Claimed): void {
    // Filter for events which were emitted in a tx originating from
    // BAL team and the event's from address has to point to Disperse.app
    let id = event.params._claimant
        .toHexString()
        .concat('-')
        .concat(event.logIndex.toString())
    let reward = new Reward(id)
    reward.exchange = "BALANCER"
    reward.amount = event.params._balance.toBigDecimal().times(DENOMINATION)
    reward.user = event.params._claimant
    reward.transaction = event.transaction.hash
    reward.blockNumber = event.block.number
    reward.blockTimestamp = event.block.timestamp
    reward.save()
}