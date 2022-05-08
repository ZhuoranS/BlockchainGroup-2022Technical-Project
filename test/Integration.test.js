const { assert } = require('chai')

const NFTMarketplace = artifacts.require('NFTMarketplace')
const NFTManager = artifacts.require('NFTManager')
const P2PLoan = artifacts.require('P2PLoan')
const BlindAuction = artifacts.require('BlindAuction')

// Truffle Console test
// NFTManager.deployed().then(function(instance){app=instance})

require('chai')
  .use(require('chai-as-promised'))
  .should()


contract('Integration', (accounts) => {

  describe('start deploying contracts', async () => {
    let market_contract
    let nft_contract
    let loan_contract
    let auction_contract
    before(async () => {
      market_contract = await NFTMarketplace.deployed()
      nft_contract = await NFTManager.deployed()
      loan_contract = await P2PLoan.deployed()
      auction_contract = await BlindAuction.deployed()
    })
    it('User A creates a NFT', async () => {
      
      const token_URI_1 = "https://ipfs.io/ipfs/Qmd9MCGtdVz2miNumBHDbvj8bigSgTwnr4SbyH6DNnpWdt?filename=1-PUG.json"
      // somehow token_id_1 returned is not an int.
      await nft_contract.createToken(token_URI_1,'NFT 1',{from:accounts[0]})
      //console.log(token_id_1)
      const token_id_1 = await nft_contract.getLatestId()
      assert.equal(token_id_1, 1)
      const requested_uri = await nft_contract.tokenURI(token_id_1)
      assert.equal(requested_uri,token_URI_1)
      const owner_1 = await nft_contract.ownerOf(token_id_1)
      assert.equal(owner_1,accounts[0])
    })
    it('User A start an auction: lock NFT', async () =>{

    })
    it('Auction ends, start Loan', async () =>{

    })
    it('Loan ends, check result: payment, NFT ownership', async () =>{

  })

  })
})
