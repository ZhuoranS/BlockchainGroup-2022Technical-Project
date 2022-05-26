import React, { useState, useEffect } from "react";
import styled from "styled-components";
import CardContainer from "./CardContainer";
import {useHistory} from "react-router-dom";
import { timeSince } from "../utils";

import { getTokenURI } from "../utils/Web3Client";
import { fetchTokenInfo, getAuctionEndTime } from "../utils/Utils";

export const AuctionWrapper = styled.div`
  height: 100%;
  width: 100%;
  border-radius: 4px;
  background: ${(props) => props.theme.white};
  display: flex;
  justify-content: space-between;
  flex-direction: column;

  .img-wrapper {
    display: flex;
    height: 75%;
    justify-content: center;
  }

  img {
    cursor: pointer;
    width: auto;
    height: auto;
    border-radius: 4px;
  }

  .auction-footer {
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .auction-info {
      height: 10%;
  }

  .username {
    padding-right: 0.3rem;
  }

`;

const Auction = ({ auction }) => {
  const history = useHistory();
  const [nft, setNFT] = useState({})
  const [tokenInfo, setTokenInfo] = useState({})
  const [auctionEndTime, setAuctionEndTime] = useState("")

  const getAuctionTime = () => {
    setAuctionEndTime(auction.auctionEnded ? "AUCTION ENDED" : "Live until " + getAuctionEndTime(auction))
  }

  const getTokenInfo = async () => {
      let newTokenInfo = await fetchTokenInfo(auction.NFT_tokenID);
      let parsedTokenInfo = JSON.parse(newTokenInfo)
      
      setTokenInfo(parsedTokenInfo)
      getAuctionTime();
  }

  useEffect(() => {
    getTokenInfo();
  }, [])

  return (
      <CardContainer>
        <AuctionWrapper>

            <div className="img-wrapper">
            <img
              onClick={() => history.push(`/auctions/${auction?.NFT_tokenID}`)}
              src={tokenInfo?.image}
              alt="auction-img"
            />
            </div>


            <div className="auction-footer">
                <div className="auction-info">
                    <b className="title bold">
                        {tokenInfo?.name}
                    </b>
                    <span className="secondary">
                    {" | posted by "}
                    </span>
                    <span>
                        {auction?.beneficiary.substr(0,8)}
                    </span>
                </div>
                <h5>
                    <span className="secondary">{auctionEndTime}</span>
                </h5>
            </div>

        </AuctionWrapper>
      </CardContainer>
  );
};

export default Auction;
