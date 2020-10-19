# dex-rewards-subgraph
A subgraph indexing rewards from Balancer yield farming and claimed rewards from Uniswap pools

## Balancer

The subgraph computes the rewards by indexing the Transfer event on the Bal token
[contract](https://etherscan.io/address/0xba100000625a3754423978a60c9317c58a424e3d). 
- Transfer(address indexed _from, address indexed _to, uint256 _value)

## Uniswap
Tracked UNI pools:

* [ETH/WBTC](https://etherscan.io/address/0xca35e32e7926b96a9988f61d510e038108d8068e)
* [ETH/USDC](https://etherscan.io/address/0x7fba4b8dc5e7616e59622806932dbea72537a56b)
* [ETH/USDT](https://etherscan.io/address/0x6c3e4cb2e96b01f4b866965a91ed4437839a121a)
* [ETH/DAI](https://etherscan.io/address/0xa1484c3aa22a66c62b77e0ae78e15258bd0cb711)

### Compilation and deployment

1. Install the dependencies:
    ```bash
    npm install
    ```
2. Generate the types:
    ```bash
    npm run codegen
    ```
3. Authenticate yourself:
    ```bash
    graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN>
    ```
3. Deploy:
    ```bash
    npm run deploy
    ```