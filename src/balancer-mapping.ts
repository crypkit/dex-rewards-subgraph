import {Transfer} from "../generated/BalTokenContract/ERC20";
import {Reward} from "../generated/schema";


export function handleTransfer(event: Transfer): void {
    if (event.transaction.from.toString() ===
        "0xcb3d284995e2ed50f8e9971718f2166a95ff83c2" &&
        event.params.from.toString() ===
        "0xd152f549545093347a162dce210e7293f1452150") {
        // Filter for events which were emitted in a tx originating from
        // BAL team and the event's from address has to point to Disperse.app
        let reward = new Reward(event.params.to.toString() + "-" + event.block.timestamp.toString())
        reward.exchange = "BALANCER"
        reward.amount = event.params.value
        reward.user = event.params.to
        reward.blockNumber = event.block.number
        reward.blockTimestamp = event.block.timestamp
        reward.save()
    }
}