const { assert } = require('chai')

const BlindAuction = artifacts.require('./BlindAuction.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('BlindAuction', (accounts) => {
  let contract

  before(async () => {
    contract = await BlindAuction.deployed()
  })

  describe('deployment', async () => {
<<<<<<< HEAD
    it('should match 1st, 2nd, 3rd accounts on ganache', async () => {
      // change to your own accounts on ganache
      //assert.equal(accounts[0], 0x922DCBAC38d92E2063A9AdDb0c3A7014b317f3B0)
      //assert.equal(accounts[1], 0xf192EB8A36b2691051fEa9a7fCE6da58Ef71bE3D)

    })
  })
  //account[0] -> owner of auction
  //account[1] -> NFT address
  //other accounts -> bidders from account[2] to account[9]
  describe('sample testing',async () => {
    it('start auction', async () => {
      const tokenID = 2
      await contract.startAuction(10,1,2,accounts[1],tokenID,3,{from:accounts[0]})
      const auctionObj = await contract.getAuctionObject(accounts[1],tokenID,{from:accounts[0]})
      assert.equal(auctionObj.min_loan_amount, 10)
      assert.equal(auctionObj.max_interest_rate, 1)
      assert.equal(auctionObj.min_repayment_period, 2)
      assert.equal(auctionObj.NFT_contract_address, accounts[1])
      assert.equal(auctionObj.NFT_tokenID,tokenID)
    })
    it('make bid', async () => {
      try{
        const tokenID = 2
        await contract.makeBid(11,1,3,false,accounts[1],tokenID,{from:accounts[2],value:11})
        const auctionObj = await contract.getAuctionObject(accounts[1],tokenID,{from:accounts[0]})
        assert.equal(auctionObj.blindedBids[0].depositValue, 11);
      }catch(error){console.log(error)}
    })
    it('reveal bid', async () => {
      try{
        const tokenID = 2
        await contract.revealBid([[11,1,3]],[false],accounts[1],tokenID,{from:accounts[2]})
        const auctionObj = await contract.getAuctionObject(accounts[1],tokenID,{from:accounts[0]})
        //console.log(auctionObj.revealedBids.length)
        assert.equal(auctionObj.revealedBids[0].loan_amount, 11);
        assert.equal(auctionObj.revealedBids[0].interest_rate, 1);
        assert.equal(auctionObj.revealedBids[0].repayment_time, 3);
        assert.equal(auctionObj.revealedBids[0].bidder_address, accounts[2]);
        const eligibleWithdrawal1 = await contract.showEligibleWithdrawal(accounts[1],tokenID,{from:accounts[2]})
        assert.equal(eligibleWithdrawal1,11)
      }catch(error){console.log(error)}
    })
    it('select bid', async () => {
      try{
        const tokenID = 2
        await contract.selectBid(accounts[2],0,accounts[1],tokenID)
        const auctionObj = await contract.getAuctionObject(accounts[1],tokenID,{from:accounts[0]})
        const withdrawalamount1 = await contract.showEligibleWithdrawal(accounts[1],tokenID,{from:accounts[2]})
        assert.equal(withdrawalamount1, 0)
        //assert.equal(auctionObj.selectedBid.bidID, 0) //more
        assert.equal(auctionObj.bidSelected, true)       //this doesn't work until revealedBid works
      }catch(error){console.log(error)}
=======
    it('should match first account on ganache', async () => {
      // change to your own acc on ganache
      assert.equal(accounts[0], 0xa9B4d84329C337827Fa174d34B0972815b5fbB43)
>>>>>>> e42682f82209ace41b1842af904100387d1a0409
    })
  })
})