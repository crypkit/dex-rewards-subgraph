import {BigInt} from "@graphprotocol/graph-ts/index";
import {CurrentBlock} from "../generated/schema";

export function updateCurrentBlock(number: BigInt, timestamp: BigInt): void {
    let currentBlock = new CurrentBlock("CURRENT");
    currentBlock.number = number
    currentBlock.timestamp = timestamp
    currentBlock.save()
}