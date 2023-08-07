const { assert, expect } = require("chai")
const { network, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Nft Marketplace Tests", function () {
          let nftmarketplace, basicNft, deployer, player
          const PRICE = ethers.utils.parseEther("0.1")
          const TOKEN_ID = 0

          beforeEach(async function () {
              //   player = (await getNamedAccounts()).player
              deployer = (await getNamedAccounts()).deployer
              accounts = await ethers.getSigners()
              player = accounts[1]
              await deployments.fixture(["all"]) // to get all the deployments
              nftmarketplace = await ethers.getContract("NFTMarketplace")
              // nftmarketplace = await nftmarketplace.connect(player) // if we want to connect player
              basicNft = await ethers.getContract("BasicNft")
              await basicNft.mintNft()
              await basicNft.approve(nftmarketplace.address, TOKEN_ID)
          })
          describe("nftMinted", function () {
              it("Mints an nft", async function () {
                  assert((await basicNft.getTokenCounter()) - 1 == 0)
              })
          })
          describe("listItem", function () {
              it("emits an event after listing an item", async function () {
                  expect(await nftmarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)).to.emit(
                      "ItemListed"
                  )
              })

              it("listsItem", async function () {
                  await nftmarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  const listing = await nftmarketplace.getListing(basicNft.address, TOKEN_ID)
                  assert(listing.price.toString() == PRICE.toString())
              })

              it("Alreadylisted", async function () {
                  await nftmarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  await expect(
                      nftmarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith("AlreadyListed")
              })
          })

          describe("ListItem and buyItem", function () {
              it("lists and can be bought", async function () {
                  await nftmarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  playerConnectedNftMarketplace = nftmarketplace.connect(player)
                  await playerConnectedNftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                      value: PRICE,
                  })
                  const newOwner = await basicNft.ownerOf(TOKEN_ID)
                  const deployerProceeds = await nftmarketplace.getProceeds(deployer)
                  assert(newOwner.toString() == player.address)
                  assert(deployerProceeds.toString() == PRICE.toString())
              })
              it("Canceling the listing", async function () {
                  await nftmarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  await nftmarketplace.cancelListing(basicNft.address, TOKEN_ID)
                  const listing = await nftmarketplace.getListing(basicNft.address, TOKEN_ID)
                  assert(listing.price.toString() !== PRICE.toString())
              })
              it("Item is not listed", async function () {
                  await expect(
                      nftmarketplace.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
                  ).to.be.revertedWith("NotListed")
              })
          })
          describe("Updating the Listing", function () {
              it("Updates the listing", async function () {
                  await nftmarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  const newPrice = ethers.utils.parseEther("0.2")
                  await nftmarketplace.updateListing(basicNft.address, TOKEN_ID, newPrice)
                  const listing = await nftmarketplace.getListing(basicNft.address, TOKEN_ID)
                  assert(listing.price.toString() !== PRICE.toString())
                  assert(listing.price.toString() == newPrice.toString())
              })
              it("Price to low", async function () {
                  await nftmarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  const newPrice = ethers.utils.parseEther("0.2")
                  await nftmarketplace.updateListing(basicNft.address, TOKEN_ID, newPrice)
                  const ConnectedPlayer = nftmarketplace.connect(player)
                  await expect(
                      ConnectedPlayer.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
                  ).to.be.revertedWith("PriceNotMet")
              })
              it("Not Owner, can't update", async function () {
                  await nftmarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  const newPrice = ethers.utils.parseEther("0.2")
                  const ConnectedPlayer = nftmarketplace.connect(player)
                  await expect(
                      ConnectedPlayer.updateListing(basicNft.address, TOKEN_ID, newPrice)
                  ).to.be.revertedWith("NotOwner")
              })
          })
          describe("Withdraw proceeds", function () {
              it("the accouts has proceeds", async function () {
                  await nftmarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  const ConnectedPlayer = nftmarketplace.connect(player)
                  await ConnectedPlayer.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
                  const proceeds = await nftmarketplace.getProceeds(deployer)
                  assert(proceeds.toString() == PRICE.toString())
              })
              it("proceeds after withdrawing", async function () {
                  await nftmarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  const ConnectedPlayer = nftmarketplace.connect(player)
                  await ConnectedPlayer.buyItem(basicNft.address, TOKEN_ID, { value: PRICE })
                  await nftmarketplace.withdrawProceeds()
                  const proceeds = await nftmarketplace.getProceeds(deployer)
                  assert(proceeds.toString() !== PRICE.toString())
              })
              it("no proceeds", async function () {
                  await nftmarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  await expect(nftmarketplace.withdrawProceeds()).to.be.revertedWith("NoProceeds")
              })
          })
      })
