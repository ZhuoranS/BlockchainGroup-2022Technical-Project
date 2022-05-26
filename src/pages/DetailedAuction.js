import React, { useRef, useState, useEffect, useContext } from "react";
import { useHistory, useParams } from "react-router-dom";
import styled from "styled-components";
import Placeholder from "../components/Placeholder";
import Avatar from "../styles/Avatar";
import Loader from "../components/Loader";
import useInput from "../hooks/useInput";
import { client } from "../utils";
import { timeSince } from "../utils";
import { CloseIcon, MoreIcon, CommentIcon, InboxIcon } from "../components/Icons";
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
import {toast} from "react-toastify";
import Bid from "../components/Bid"
import { UserContext } from "../context/UserContext";
import Button from "../styles/Button";

import { fetchTokenInfo, getAuctionEndTime } from "../utils/Utils";
import { endAuction, getAuctionObject, makeBid } from "../utils/Web3Client";
import NFTManager from '../abis/NFTManager.json';

const Wrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto auto;
  grid-template-areas: 
    "header header"
    "content_container content_container" 
    "footer footer";

  border: 2px solid ${(props) => props.theme.borderColor};
  border-radius: 0.5rem;

  .header {
    grid-area: header;
  }

  .content-container {
    grid-area: content_container;
    max-height: 500px;

    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto;
    grid-template-areas: 
      "nft_img bid_history";
  }

  .nft-image {
    grid-area: nft_img;
    border-right: 1px solid ${(props) => props.theme.borderColor};

    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .bid-history {
    grid-area: bid_history;
    overflow-y: scroll;
  }

  .footer {
    grid-area: footer;
    border-top: 5px solid ${(props) => props.theme.borderColor};
  }

  .post-img {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: cover;
  }

  .icon-locked {
    margin: 5rem auto auto auto;

    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .post-header-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 5px solid ${(props) => props.theme.borderColor};
  }

  .post-header {
    display: flex;
    align-items: start;
    flex-direction: column;
  }
  
  svg {
    margin-right: 1rem;
  }

  .add-bid {
    display: grid;
    grid-template-columns: 5fr 5fr 5fr 2fr;
    grid-gap: 1rem;
    padding: 1rem;
  }

  .input-container {
    border: 1px solid ${(props) => props.theme.borderColor};
    /* border-radius: 1rem; */
    display: grid;
    grid-template-columns: 6fr 1fr;
    overflow: hidden;
  }

  .units-field {
    text-align: center;
    padding: 1rem;
    background-color: lightgray;
  }

  input {
    padding: 1rem;
    width: 100%;
    height: 100%;
    background: ${(props) => props.theme.bg};
    border: none;
    resize: none;
    text-align: center;
    font-size: 1rem;
    font-family: "Fira Sans", sans-serif;
  }

  ul {
    display: flex;
    justify-content: space-between;
    position: relative;
    top: 3px;
    list-style-type: none;
    width: 100%;
  }

  li {
    margin-left: 1rem;
    align-items: center;
  }

  button {
    font-size: 1rem;
  }

  .select-bid-container {
    padding: 1rem;

    /* display: flex;
    flex-direction: column; */
  }

  .select-bid-button {
    padding: 1rem;
    width: 100%;

    transition: background-color 0.3s, color 0.3s ;
  }

  .select-bid-button:hover:enabled {
    background-color: ${(props) => props.theme.primaryButtonColor};
    color: white;

    transition: background-color 0.3s, color 0.3s ;
  }

  .place-bid-button {
    transition: background-color 0.3s, color 0.3s ;
  }

  .place-bid-button:hover {
    background-color: ${(props) => props.theme.primaryButtonColor};
    color: white;

    transition: background-color 0.3s, color 0.3s ;
  }

  
  .bids {
      padding: 1rem;
      max-height: 100%;
      overflow-y: scroll;
  }
  
  .bids::-webkit-scrollbar {
      width: 0;
      height: 0;
  } 

  @media screen and (max-width: 840px) {
    display: flex;
    flex-direction: column;

    .bids {
      height: 100%;
    }

    .add-bid {
      display: flex;
      flex-direction: column;
    }

    .bid-history-locked {
      border-top: 1px solid ${(props) => props.theme.borderColor};
    }
  }
`;

const DetailedAuction = () => {
  const history = useHistory();
  const { tokenId } = useParams();

  const [loading, setLoading] = useState(true);
  const [deadend, setDeadend] = useState(false);
  const [post, setPost] = useState({});
  const [tokenInfo, setTokenInfo] = useState({})
  const [auction, setAuction] = useState({})
  const [auctionEndTime, setAuctionEndTime] = useState("")
  const [currUserBids, setCurrUserBids] = useState([])

  const {user} = useContext(UserContext);

  const newAmount = useInput("");
  const newInterest = useInput("");
  const newRepaymentPeriod = useInput("");
  const [bids, setBids] = useState([]);

  const networkId = localStorage.getItem("networkId");
  const addressNFTManager = NFTManager.networks[networkId].address;

  const handleAddBid = (e) => {
    if (!newAmount.value || !newInterest.value || !newRepaymentPeriod.value) {
        return toast.error("Please fill in all fields");
    }

    makeBid(newAmount.value, newInterest.value, newRepaymentPeriod.value, false, addressNFTManager, tokenId)

    newAmount.setValue("");
    newInterest.setValue("");
    newRepaymentPeriod.setValue("");

    return toast.success("Bid successfully placed");
  };

  const getTokenInfo = async () => {
    let newTokenInfo = await fetchTokenInfo(tokenId);
    let parsedTokenInfo = JSON.parse(newTokenInfo)
    
    setTokenInfo(parsedTokenInfo)
  }

  const getAuctionInfo = async () => {
    let auction = await getAuctionObject(addressNFTManager, tokenId);

    setAuction(auction)
    setAuctionEndTime(auction.auctionEnded ? "AUCTION ENDED" : "Live until " + getAuctionEndTime(auction))
  }

  const getCurrUserBids = async () => {
    let userBids = [];
    let auction = await getAuctionObject(addressNFTManager, tokenId);

    for (let i = 0; i < auction.revealedBids.length; i++) {
      let bid = auction.revealedBids[i]

      if (bid.bidder_address == user.address) {
        bid.bidId = i
        userBids.push(bid)
      }
    }

    setCurrUserBids(userBids)
  }

  // TODO: implement bidding history visibility control
  useEffect(() => {

    setLoading(false);
    setDeadend(false);
    getTokenInfo(tokenId);
    getAuctionInfo();
    getCurrUserBids();

  }, []);

  if (!deadend && loading) {
    return <Loader />;
  }

  if (deadend) {
    return (
      <Placeholder
        title="Sorry, this page isn't available"
        text="The link you followed may be broken, or the page may have been removed"
      />
    );
  }

  return (
    <Wrapper>

      <div className="header">
        <div className="post-header-wrapper">
          <div className="post-header">
            <h3>
              <strong>{tokenInfo?.name}</strong>
            </h3>
            <h5>
              {`owned by ${auction?.beneficiary?.substr(0, 8)}`}
            </h5>
          </div>
          <div className="auction-details"><h1>{auctionEndTime}</h1></div>
          <div className="post-header">
            <CloseIcon onClick={() => history.goBack()} />
          </div>
        </div>
      </div>

      <div className="content-container">
        <div className="nft-image">
          <img
            className="post-img"
            src={tokenInfo?.image}
            alt="post"
          />
        </div>

        <div className="bid-history">
          {auction?.auctionEnded ? 
              <div className="bids">
                  {auction?.revealedBids?.map((bid) => (
                    <Bid 
                      user={bid?.bidder_address}
                      amount={parseInt(bid?.loan_amount._hex, 16)}
                      duration={parseInt(bid?.repayment_time._hex)}
                      interest={parseInt(bid?.interest_rate._hex, 16)}
                      time={0}
                    />
                  ))}
              </div>
          :
            <div className="bids">
              {currUserBids?.map(bid => (
                <Bid 
                  user={bid?.bidder_address}
                  amount={parseInt(bid?.loan_amount._hex, 16)}
                  duration={parseInt(bid?.repayment_time._hex)}
                  interest={parseInt(bid?.interest_rate._hex, 16)}
                  time={0}
                />
              ))}
              <div className="icon-locked">
                  <LockClockOutlinedIcon style={{"fontSize": "200px", "cursor": "default"}} />
                  <h3>Others' Bids Locked Until Auction Ends</h3>
              </div>
            </div>
          }
        </div>
      </div>
      

      <div className="footer">
          {auction?.beneficiary?.substr(0,8) == user.address.substr(0,8) 
            ? 
              <div className="select-bid-container">
                <Button
                  className="select-bid-button" 
                  onClick={() => history.push(`/select/${auction?.NFT_tokenID}`)}
                  disabled={!auction?.auctionEnded}
                  style={{"cursor": auction?.auctionEnded ? "pointer" : "not-allowed"}}
                  secondary
                >
                  Select Winning Bid
                </Button>
              </div> 
            : 
            <div className="add-bid">
                <div className="input-container">
                  <input
                    className="amount-field"
                    type="number"
                    placeholder="Loan Amount"
                    min="0.01"
                    step="0.01"
                    value={newAmount.value}
                    onChange={newAmount.onChange}
                  />
                  <span className="units-field">ETH</span>
                </div>
                <div className="input-container">
                  <input
                    className="interest-field"
                    type="number"
                    placeholder="Interest Rate"
                    min="0"
                    step="0.25"
                    value={newInterest.value}
                    onChange={newInterest.onChange}
                  />
                  <span className="units-field">%</span>
                </div>
                <div className="input-container">
                  <input
                    className="repayment-field"
                    type="number"
                    placeholder="Repayment Period"
                    min="1"
                    step="1"
                    value={newRepaymentPeriod.value}
                    onChange={newRepaymentPeriod.onChange}
                  />
                  <span className="units-field">Days</span>
                </div>
                <Button className="place-bid-button" onClick={handleAddBid} secondary>Place Bid</Button>
              </div>
            }
        </div>

    </Wrapper>
  );
};

export default DetailedAuction;
