const { network } = require("hardhat")
const { verify } = require("../utils/verify")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const VERIFICATION_BLOCK_CONFIRMATIONS = 6
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    args = []
    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    //DEPLOY
    log("----------------------------------")
    log("DEPLOYING CONTRACT....")
    const nftmarketplace = await deploy("NFTMarketplace", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    log("Contract deployed!")

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(nftmarketplace.address, args)
    }
}

module.exports.tags = ["all", "nftmarketplace"]
