import {Address} from "@graphprotocol/graph-ts"
import {Transfer} from "../generated/BalTokenContract/ERC20";
import {Reward} from "../generated/schema";

let txOriginator = Address.fromString("0xcb3d284995e2ed50f8e9971718f2166a95ff83c2")
let disperseApp = Address.fromString("0xd152f549545093347a162dce210e7293f1452150")


export function handleTransfer(event: Transfer): void {
    if (event.transaction.from == txOriginator && event.params.from == disperseApp) {
        // Filter for events which were emitted in a tx originating from
        // BAL team and the event's from address has to point to Disperse.app
        let reward = new Reward(event.params.to.toHexString() + "-" + event.logIndex.toString())
        reward.exchange = "BALANCER"
        reward.amount = event.params.value
        reward.user = event.params.to
        reward.blockNumber = event.block.number
        reward.blockTimestamp = event.block.timestamp
        reward.save()
    }
}