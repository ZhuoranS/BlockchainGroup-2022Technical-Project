// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract BlindAuction {
    struct BlindedBid{
        // blinded/hashed version of bid
        bytes32 hashedBidVal;
        // address of bidder
        address bidder_address;
        // deposit
        uint depositValue;
    }

    struct RevealedBid{
        uint loan_amount;
        uint interest_rate;
        uint repayment_time;
        // ID identifying the bid
        //uint bidID;
        // address of bidder
        address bidder_address;
    }

    struct Auction_Object{
        // address of the loanee who will receive the loan once the auction ends or they selected a bid
        address payable beneficiary; // the owner of the NFT i.e the person who wants a loan

        // NFT collection contract address 
        address NFT_contract_address;

        //Individual NFT tokenID 
        uint32 NFT_tokenID;

        // minimum acceptable loan amount
        uint min_loan_amount;

        // maximum interest rate
        uint max_interest_rate;

        // minimum repayment period
        uint min_repayment_period;

        // list of blinded bids
        BlindedBid[] blindedBids;

        // list of revealed bids
        RevealedBid[] revealedBids;

        // the Auction window 
        uint auctionEndTime;

        // whether the owner of auction i.e the beneficiary has selected a bid
        bool bidSelected;

        // address of selected bid
        RevealedBid selectedBid;

        // whether the auction has ended
        bool auctionEnded;

        // whether the owner of auction i.e the beneficiary has canceled the auction
        bool auctionCanceled;

        // whether all bids have been revealed
        bool allBidsRevealed;

        }

    // mapping of NFT_contract_address to NFT_tokenID to auction_objects
    mapping(address=>mapping(uint32=>Auction_Object)) public Auction_Objects;


    //maps NFT contract address to individual NFT token ID to specific bidder address to their Blinded Bid
    mapping(address=>mapping(uint32=>mapping(address=>BlindedBid[]))) public allBlindedBids;

    //maps NFT contract address to individual NFT token ID to specific bidder address to the withdrawal amt they're supposed to get
    mapping(address=>mapping(uint32=>mapping(address=>uint))) public eligibleWithdrawals;

    // auctionObjects Array;
    Auction_Object[] Auction_Objects_array;
    uint32 Auction_Objects_count = 0;
    // mapping of NFT contract address to individual NFT token ID  to boolean. Necessary for checking whether the NFT is already staked
    mapping(address=>mapping(uint32=>bool)) NFT_staked_bool;
    //uint NFT_contract_addresses_tokenIDs_count = 0;
    //address[] NFT_contract_addresses_tokenIDs_arr;

    // makes the Hash value
    function generateHashedBid(uint loan_amt, uint int_rate, uint repayment_period, bool fake) internal pure returns (bytes32){
        return keccak256(abi.encodePacked(loan_amt, int_rate, repayment_period, fake));
    }

    function startAuction(uint min_loan_amount, uint max_interest_rate, uint min_repayment_period, address NFT_contract_address, uint32 NFT_tokenID, uint auction_duration) public{
        //NFT contract address + tokenID -> hashValue
        
        
        // identifies the state of the auction
        // add new Auction Object
        // each has a distinct NFT address
        // need to check that NFT is not already staked
        require(!NFT_staked_bool[NFT_contract_address][NFT_tokenID], "NFT is already staked");
        Auction_Object storage auctionObj = Auction_Objects[NFT_contract_address][NFT_tokenID];
        auctionObj.beneficiary = payable(msg.sender);
        auctionObj.min_loan_amount = min_loan_amount;
        auctionObj.max_interest_rate = max_interest_rate;
        auctionObj.min_repayment_period = min_repayment_period;
        auctionObj.NFT_contract_address = NFT_contract_address;
        auctionObj.NFT_tokenID = NFT_tokenID;
        auctionObj.auctionEndTime = block.timestamp + auction_duration * 1 hours;
        auctionObj.bidSelected = false;
        auctionObj.auctionCanceled  = false;
        auctionObj.allBidsRevealed = false;
        Auction_Objects[NFT_contract_address][NFT_tokenID] = auctionObj;


        // since NFT has been staked change boolean to true
        NFT_staked_bool[NFT_contract_address][NFT_tokenID] = true;
        // just incase: we maintain a list of all current auctioned NFTS
        //NFT_contract_addresses_arr.push(NFT_contract_address);
        //NFT_contract_addresses_count += 1;

        Auction_Objects_array.push(auctionObj);
        Auction_Objects_count += 1;
    }
    
    function makeBid(uint loan_amt, uint int_rate, uint repayment_period, bool fake, address NFT_contract_address,uint32 NFT_tokenID) payable public{
        Auction_Object storage auctionObj = Auction_Objects[NFT_contract_address][NFT_tokenID];
        //require (!auctionObj.auctionEnded, "Auction has Ended");
        //require(!auctionObj.auctionCanceled, "Auction was canceled");
        // ensure that bidder is not making the same bid
        bytes32 HashVal = generateHashedBid(loan_amt, int_rate, repayment_period, fake);
        BlindedBid[] storage bidsToCheck = allBlindedBids[NFT_contract_address][NFT_tokenID][msg.sender];
        for(uint i = 0; i < bidsToCheck.length; i++){
            require(bidsToCheck[i].hashedBidVal != HashVal, "You've already placed this bid before");
        }
        // add bid to availableBids
        auctionObj.blindedBids.push(
            BlindedBid(HashVal, msg.sender, msg.value
            ));
        allBlindedBids[NFT_contract_address][NFT_tokenID][msg.sender].push(
            BlindedBid(HashVal, msg.sender, msg.value
            )
        );
    }

     function revealBid(uint[][] memory allSentLoanTerms, bool[] memory fake_, address NFT_contract_address,uint32 NFT_tokenID) public{
        Auction_Object storage auctionObj = Auction_Objects[NFT_contract_address][NFT_tokenID];
        BlindedBid[] storage bidsToCheck = allBlindedBids[NFT_contract_address][NFT_tokenID][msg.sender];
        //require(auctionObj.auctionEnded, "Auction has not ended");
        //require(allSentLoanTerms.length == bidsToCheck.length,"Different Lengths");
        //require(fake_.length == bidsToCheck.length,"Different Lengths");
        for(uint i = 0; i < bidsToCheck.length ;i++){
            (uint loan_amt,uint int_rate, uint rep_period) = (allSentLoanTerms[i][0],allSentLoanTerms[i][1],allSentLoanTerms[i][2]);
            bool fake = fake_[i];
            if (bidsToCheck[i].hashedBidVal != generateHashedBid(loan_amt,int_rate,rep_period,fake)){
                // bid was not revealed so continue
                continue;
            }
            // check if not fake and that the depositValue is enough
            if (!fake && bidsToCheck[i].depositValue >= loan_amt){
                // check is the bid meet loan terms criteria
                if (loan_amt >= auctionObj.min_loan_amount && 
                int_rate <= auctionObj.max_interest_rate && 
                rep_period >= auctionObj.min_repayment_period){
                    auctionObj.revealedBids.push(
                        RevealedBid(loan_amt,int_rate,rep_period,msg.sender)
                        );
                    //auctionObj.bidIDcounter += 1;
                }
            }
            // Make it impossible for the sender to re-claim
            // the same deposit.
            bidsToCheck[i].hashedBidVal = 0x0;

            // save the money they deposited as eligible withdrawal
            eligibleWithdrawals[NFT_contract_address][NFT_tokenID][msg.sender] += bidsToCheck[i].depositValue;

        }

    }

    function selectBid(address selectedLender, uint256 bidID, address NFT_contract_address,uint32 NFT_tokenID) public{
        Auction_Object storage auctionObj = Auction_Objects[NFT_contract_address][NFT_tokenID];
        //require(!auctionObj.bidSelected, "A bid has already been selected");
	    //require(!auctionObj.auctionCanceled, "Auction was canceled");
        auctionObj.auctionEnded = true;
        
        require(auctionObj.revealedBids[bidID].bidder_address == selectedLender,"BidID doesn't correspond with selectedLender");
       
        RevealedBid storage bidSelected = auctionObj.revealedBids[bidID];
        eligibleWithdrawals[NFT_contract_address][NFT_tokenID][selectedLender] = eligibleWithdrawals[NFT_contract_address][NFT_tokenID][selectedLender] - bidSelected.loan_amount;
        //transfer ether to the beneficiary of the auction i.e the loanee
        auctionObj.beneficiary.transfer(bidSelected.loan_amount);
        auctionObj.selectedBid = bidSelected;
        auctionObj.bidSelected = true;
        //invoking loan contract

    }

    function endAuction(address NFT_contract_address,uint32 NFT_tokenID) public {
        Auction_Object storage auctionObj = Auction_Objects[NFT_contract_address][NFT_tokenID];
        require(!auctionObj.auctionEnded, "Auction already ended");
        require(!auctionObj.auctionCanceled, "Auction already canceled");
        require(block.timestamp >= auctionObj.auctionEndTime, "Auction duration has not elapsed yet");

        auctionObj.auctionEnded = true;
    }

    function cancelAuction(address NFT_contract_address,uint32 NFT_tokenID) public{
        Auction_Object storage auctionObj = Auction_Objects[NFT_contract_address][NFT_tokenID];
        require(!auctionObj.auctionEnded, "Auction already ended");
        require(!auctionObj.auctionCanceled, "Auction already canceled");
        require(!auctionObj.bidSelected, "Bid already selected");

        auctionObj.auctionCanceled = true;
    }

    // Allows bidders whose bids were not selected to withdraw the ether they had bid.
    //The function is only viewable by the bidders-> frontend

    // for the selected bidder who has made more than one bid, it needs to return the bids that are not selected
    function withdraw(address NFT_contract_address,uint32 NFT_tokenID) public 
    {
        Auction_Object storage auctionObj = Auction_Objects[NFT_contract_address][NFT_tokenID];
        require(auctionObj.auctionEnded, "Auction has not ended yet");
        require(auctionObj.bidSelected, "The auction owner has not selected a bid yet");
        uint256 amount = eligibleWithdrawals[NFT_contract_address][NFT_tokenID][msg.sender];

        // a more secure way to do this??
        // https://docs.soliditylang.org/en/v0.8.7/common-patterns.html
        if (amount > 0) {
            // Set the account's eligible withdrawal to zero
            eligibleWithdrawals[NFT_contract_address][NFT_tokenID][msg.sender] = 0;
            // pay back the money they sent
            // read that call is better than transfer for receiving money????
            payable(msg.sender).transfer(amount);
        }
    }

    // get a single Auction Object for one NFT address
    function getAuctionObject(address NFT_contract_address,uint32 NFT_tokenID) public view returns (Auction_Object memory Auct_Obj)
    {
        return Auction_Objects[NFT_contract_address][NFT_tokenID];
    }

    // get all the Auction Objects
    function getAllAuctionObjects() public view returns (Auction_Object[] memory Auct_Objs)
    {
        return Auction_Objects_array;
    }

    // delete NFT listing i.e after the loan has been repayed
    function removeNFTListing(address NFT_contract_address,uint32 NFT_tokenID) public 
    {
        require(NFT_staked_bool[NFT_contract_address][NFT_tokenID],"NFT has not been staked");
        NFT_staked_bool[NFT_contract_address][NFT_tokenID] = false;
        /*uint NFT_index = 0;
        for(uint i = 0; i < NFT_contract_addresses_count; i++){
            if(NFT_contract_addresses_arr[i] == NFT_contract_address){
                NFT_index = i;
                NFT_staked_bool[NFT_contract_address][NFT_tokenID] = false;
            }
        }
        require(!NFT_staked_bool[NFT_contract_address][NFT_tokenID],"Error occurred");
        delete NFT_contract_addresses_arr[NFT_index];
        NFT_contract_addresses_count -= 1;*/
    }

    // delete an Auction
    function deleteAuction(address NFT_contract_address,uint32 NFT_tokenID) public 
    {
        delete Auction_Objects[NFT_contract_address][NFT_tokenID];
        uint32 index = 0;
        bool found;
        for(uint32 i = 0; i < Auction_Objects_count; i++){
            address testContractAddress = Auction_Objects_array[i].NFT_contract_address;
            uint32 testTokenID = Auction_Objects_array[i].NFT_tokenID;
            if(testContractAddress == NFT_contract_address && testTokenID == NFT_tokenID){
                index = i;
                found = true;
            }
        }
        require(found,"Error occurred");
        delete Auction_Objects_array[index];
        Auction_Objects_count -= 1;
    }

    //return eligible withdrawal amt bidder is entitled to from a certain auction -> just for testing purposes
    function showEligibleWithdrawal(address NFT_contract_address,uint32 NFT_tokenID) public view returns (uint256)
    {
        return eligibleWithdrawals[NFT_contract_address][NFT_tokenID][msg.sender];
    }
}