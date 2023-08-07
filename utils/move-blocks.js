const { network } = require("hardhat")

function sleep(timeInMs) {
    return new Promise((resolve) => setTimeout(resolve, timeInMs))
}

async function moveBlocks(amounts, sleepAmount = 0) {
    // sleepAmount -> sleep between blocks
    console.log("Moving blocks...")
    for (let index = 0; index < amounts; index++) {
        await network.provider.request({
            method: "evm_mine",
            params: [],
        })
        if (sleepAmount) {
            console.log(`Sleeping for ${sleepAmount}`)
            await sleep(sleepAmount)
        }
    }
}

module.exports = {
    moveBlocks,
    sleep
}
