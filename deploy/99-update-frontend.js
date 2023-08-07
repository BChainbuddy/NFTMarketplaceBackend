require("dotenv").config()
const fs = require("fs")
const { network } = require("hardhat")
const frontEndAbiLocation = "../nft-marketplace-frontend-thegraph/constants"
const frontEndContractsFile =
    "../nextjs-nft-marketplace-frontend-thegraph/constants/networkMapping.json"

module.exports = async () => {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Writing to front end...")
        // await updateContractAddresses()
        await updateAbi()
        console.log("Front end written!")
    }
}

async function updateAbi() {
    const nftMarketplace = await ethers.getContract("NFTMarketplace")
    fs.writeFileSync(
        `${frontEndAbiLocation}NFTMarketplace.json`,
        nftMarketplace.interface.format(ethers.utils.FormatTypes.json)
    )

    const basicNft = await ethers.getContract("BasicNft")
    fs.writeFileSync(
        `${frontEndAbiLocation}BasicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    )
}

// async function updateContractAddresses() {
//     const chainId = network.config.chainId.toString()
//     const nftMarketplace = await ethers.getContract("NFTMarketplace")
//     const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
//     if (chainId in contractAddresses) {
//         if (!contractAddresses[chainId]["NFTMarketplace"].includes(nftMarketplace.address)) {
//             contractAddresses[chainId]["NFTMarketplace"].push(nftMarketplace.address)
//         }
//     } else {
//         contractAddresses[chainId] = { NftMarketplace: [nftMarketplace.address] }
//     }
//     fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
// }
module.exports.tags = ["all", "frontend"]
