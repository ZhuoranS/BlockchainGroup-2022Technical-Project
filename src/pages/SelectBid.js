import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from "react-router-dom";
import { client } from "../utils";
import Button from '../styles/Button';
import styled from "styled-components";
import {toast} from "react-toastify";
import Bid from '../components/Bid';

import { fetchTokenInfo } from "../utils/Utils";
import { getAuctionObject, selectWinningBid } from '../utils/Web3Client';
import NFTManager from '../abis/NFTManager.json';
import P2PLoan from '../abis/P2PLoan.json';

export const SelectBidWrapper = styled.div`

  .bid-select-container {
    display: grid;
    border: 1px solid lightgray;
    border-radius: 0.5rem;
    margin: 1rem;
  }

  .select-button {
    border: none;

    transition: background-color 0.3s, color 0.3s ;
  }

  .select-button:hover {
    background-color: #0095f6;
    color: white;

    transition: background-color 0.3s, color 0.3s ;
  }

`;

const SelectBid = () => {
  const [bids, setBids] = useState([]);
  const [deadend, setDeadend] = useState(false);
  const [tokenInfo, setTokenInfo] = useState({})
  const [auction, setAuction] = useState({})
  
  const { tokenId } = useParams();

  const networkId = localStorage.getItem("networkId");
  const addressNFTManager = NFTManager.networks[networkId].address;
  const addressP2PLoan = P2PLoan.networks[networkId].address;

  const getTokenInfo = async () => {
    let newTokenInfo = await fetchTokenInfo(tokenId);
    let parsedTokenInfo = JSON.parse(newTokenInfo)
    
    setTokenInfo(parsedTokenInfo)
  }

  const getAuctionInfo = async () => {
    let auction = await getAuctionObject(addressNFTManager, tokenId);
    setAuction(auction)
    console.log(auction.revealedBids)
    setBids(auction.revealedBids)
  }

  useEffect(() => {

    getTokenInfo(tokenId);
    getAuctionInfo();
  }, []);

  const handleSelect = (bid, bidId) => {
    console.log(bid)
    selectWinningBid(bid.bidder_address, bidId, tokenId, addressNFTManager, addressP2PLoan)

    toast.success("Winning Bid Successfully Selected");
  }

  return (
    <div>
      <h1>Select the Winning Bid</h1>
      {bids.map((bid, bidId) => (
        <SelectBidWrapper>
          <div className="bid-select-container">
            <Bid 
              user={bid?.bidder_address} 
              amount={parseInt(bid?.loan_amount._hex, 16)} 
              duration={parseInt(bid?.repayment_time._hex)} 
              interest={parseInt(bid?.interest_rate._hex, 16)} 
              time={0}
            />
            <Button 
              className="select-button" 
              secondary
              onClick={() => handleSelect(bid, bidId)}>Select Bid</Button>
          </div>
        </SelectBidWrapper>
      ))}
    </div>
  )
}

export default SelectBid