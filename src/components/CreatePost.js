import React, {useContext, useEffect, useState} from "react";
import styled from "styled-components";
import { useHistory, useRouteMatch } from "react-router-dom";
import useInput from "../hooks/useInput";
import {client, uploadImage} from "../utils";
import { timeSince } from "../utils";
import { CloseIcon, MoreIcon, CommentIcon, InboxIcon } from "./Icons";
import {toast} from "react-toastify";
import Button from "../styles/Button";
import { FeedContext } from "../context/FeedContext";
import { Select, MenuItem, InputLabel, FormControl, TextField, OutlinedInput, InputAdornment } from "@mui/material";

import { approve, lockNFT } from "../utils/Web3Client";
import { startAuction } from "../utils/Web3Client";

// to retrieve contract addresses
import NFTManager from '../abis/NFTManager.json';
import NFTMarketplace from '../abis/NFTMarketplace.json';
import { UserContext } from "../context/UserContext";

export const CreatePostWrapper = styled.div`
  /* width: 100%; */

  .carousel {    
    position: fixed;
     
    top: 50%;
    /* left: 50%; */
    width: 50%;
    transform: translate(50%, -50%);
    z-index: 1000;

    background: ${(props) => props.theme.white};
    margin-bottom: 1.5rem;
    border-radius: 0.5rem;
    padding: 3rem 5rem;

    overflow: hidden;

    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .modal {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    transition: transform 0.3s;
  }
  
  .modal-page {
    min-width: 100%;
    width: 100%;   
  }

  .input-container {
    border: 1px solid ${(props) => props.theme.borderColor};
    /* border-radius: 1rem; */
    display: grid;
    grid-template-columns: 6fr 1fr;
    grid-template-rows: auto;
    grid-template-areas:
      "inputField unitsField";

    width: 100%;
    margin: 1rem;
  }

  .units-field {
    grid-area: unitsField;
    text-align: center;
    padding: 1rem;
    background-color: lightgray;
    width: 100%;
    border: 1px dashed blue;
  }

  input {
    grid-area: inputField;
    border: 1px dashed green;
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
  
  #create-auction-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  #summary-page {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .fill-page {
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(2px);
    z-index: 1000;
  }

  span {
    font-size: xx-large;
    font-weight: bold;
  }

  ul {
    display: flex;
    justify-content: center;
    position: relative;
    top: 3px;
    list-style-type: none;
    width: 100%;
    height: 100%;
  }

  li {
    margin-left: 1rem;
    align-items: center;
    vertical-align: center;
    height: 100%;
  }

  .button {
    margin: 1rem;
  }
  
  #create-auction-page > h1 {
    margin-left: 2rem;
    width: 80%;
  }
  
  textarea {
    margin-top: 1rem;
    height: 40px;
    width: 100%;
    font-family: "Fira Sans", sans-serif;
    font-size: 2rem;
    border: none;
    border-bottom: 1px solid ${(props) => props.theme.borderColor};
    resize: none;
  }

  .dropdown {
    width: 100%;
    margin: 1rem;
  }

  .dropdown-items {
    display: flex;
    flex-direction: row;
    border: 2px dashed blue;
  }

  @media screen and (max-width: 950px) {
    width: 100%;
    .post-img {
      width: 100%;
    }
  }
  
  @media screen and (max-width: 900px) {
    width: 480px;
    .post-img {
      width: 325px;
    }
  }
`;

// Carousel component
export const Carousel = ({ children, activeModalPage }) => {

  return (
    <div className="carousel">
      <div 
        className="modal"
        style={{ transform: `translateX(-${activeModalPage * 100}%`}}
      >
        {/* {React.Children.map(children, (child, index) => {
          return React.cloneElement(child, {width: "100%"})
        })} */}
        {children}
      </div>
    </div>
  )
}

// CreatePost is a modal which is itself a carousel
const CreatePost = ({ open, onClose, post }) => {

    const history = useHistory();
    const { feed, setFeed } = useContext(FeedContext);
    const {user} = useContext(UserContext)

    const [postImage, setPostImage] = useState("");
    const [activeModalPage, setActiveModalPage] = useState(0); // current page number on modal carousel
    const [selectedNFT, setSelectedNFT] = useState(null)

    // stores inputs
    const minLoanAmount = useInput("");
    const maxInterest = useInput("");    
    const duration = useInput("");
    const minRepaymentPeriod = useInput("");

    // if modal is not open, return null
    if (!open) return null;

    const handleSubmitPost = async () => {
        // all fields must be filled
        if (!(minLoanAmount.value && duration.value && maxInterest.value && minRepaymentPeriod.value)) {
            return toast.error("Please fill in all fields");
        }

        if (!selectedNFT) {
          return toast.error("Please choose an NFT");
        }

        const networkId = localStorage.getItem("networkId")

        const addressNFTManager = NFTManager.networks[networkId].address;
        const addressNFTMarketplace = NFTMarketplace.networks[networkId].address;

        console.log(addressNFTManager)
        console.log(addressNFTMarketplace)
        console.log("BEFORE METHODS")
        approve(addressNFTMarketplace, selectedNFT.tokenId)
        console.log("APPROVE")
        lockNFT(addressNFTManager, selectedNFT.tokenId)
        console.log("LOCK")
        startAuction(minLoanAmount.value, maxInterest.value, minRepaymentPeriod.value, duration.value, addressNFTManager, selectedNFT.tokenId)
        console.log("START AUCTION")

        minLoanAmount.value = ""
        duration.value = ""
        maxInterest.value = ""
        minRepaymentPeriod.value = ""
        setSelectedNFT(null)
        onClose();

        toast.success("Your post has been submitted successfully");
    };

    // handle carousel sliding
    const onContinue = () => {
      setActiveModalPage(activeModalPage + 2)
    }

    const onBack = () => {
      setActiveModalPage(activeModalPage - 2)
    }

    const handleSelectedNFTChange = (e) => {
      console.log(e)
      setSelectedNFT(e.target.value)
    }

    return (
      <CreatePostWrapper>
        {/* Blur rest of screen */}
        <div className="fill-page"></div>

        <Carousel activeModalPage={activeModalPage}>

          {/* Create Auction Page (Page 1) */}
          <div className="modal-page" id="create-auction-page">
            <div className="header">                
              <div><span>CREATE AUCTION</span></div>
            </div>
            <div className="dropdown">
              <FormControl fullWidth>
                <InputLabel id="select-label">Select NFT</InputLabel>
                <Select 
                  labelId="select-label"
                  value={selectedNFT || ''}
                  label="Select NFT"
                  onChange={handleSelectedNFTChange}
                >
                    {user.userNFTs.map(nft => (
                      <MenuItem value={nft}>
                        <div 
                          style={{
                            display: "flex", 
                            flexDirection: "column", 
                            alignItems: "center", 
                            justifyContent: "space-evenly", 
                            width: "100%",
                          }}
                        >
                          <img style={{width: "100px"}} src={nft.tokenInfo.image}/> 
                          <strong>{nft.tokenInfo.name}</strong>

                        </div> 
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div>

            <OutlinedInput
              id="loan-input-label"
              endAdornment={<InputAdornment position="end"><strong style={{width: "40px", textAlign: "center"}}>ETH</strong></InputAdornment>}
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
                min: "0.01",
                step: "0.01"
              }}
              type="number"
              placeholder="Min Loan Amount"
              style={{width: "100%", margin: "1rem 0"}}
              value={minLoanAmount.value}
              onChange={minLoanAmount.onChange}
            />

            <OutlinedInput
              id="loan-input-label"
              endAdornment={<InputAdornment position="end"><strong style={{width: "40px", textAlign: "center"}}>Hrs</strong></InputAdornment>}
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
                min: "1"
              }}
              type="number"
              placeholder="Loan Duration"
              style={{width: "100%", margin: "1rem 0"}}
              value={duration.value}
              onChange={duration.onChange}
            />

            <OutlinedInput
              id="loan-input-label"
              endAdornment={<InputAdornment position="end"><strong style={{width: "40px", textAlign: "center"}}>%</strong></InputAdornment>}
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
                min: "0",
                step: "0.25"
              }}
              type="number"
              placeholder="Interest Rate"
              style={{width: "100%", margin: "1rem 0"}}
              value={maxInterest.value}
              onChange={maxInterest.onChange}
            />

            <OutlinedInput
              id="loan-input-label"
              endAdornment={<InputAdornment position="end"><strong style={{width: "40px", textAlign: "center"}}>Days</strong></InputAdornment>}
              aria-describedby="outlined-weight-helper-text"
              inputProps={{
                'aria-label': 'weight',
                min: "1",
                step: "1"
              }}
              type="number"
              placeholder="Min Repayment Period"
              style={{width: "100%", margin: "1rem 0"}}
              value={minRepaymentPeriod.value}
              onChange={minRepaymentPeriod.onChange}
            />

            <ul>
                <li>
                    <Button
                        onClick={onClose}
                        className="button"
                    >
                        &#x2715; Cancel
                    </Button>
                    <Button
                        onClick={onContinue}
                        className="button"
                    >
                        Continue &#x2192;
                    </Button>
                </li>
            </ul>
          </div>

          {/* Blank Page (Page 2) */}
          <div className="modal-page" id="blank-page"></div>

          {/* Summary Page (Page 3) */}
          <div className="modal-page" id="summary-page">

            {/* TODO: FINISH PAGE (Can create component elsewhere and import here) */}
            <h1><strong>REVIEW</strong></h1>
            <h3>Make sure you have filled in all fields accurately</h3>
            <div className="review-elements">
              <p>NFT: {selectedNFT ? <img style={{width: "150px"}} src={selectedNFT.tokenInfo.image}></img> : "EMPTY"}</p>
              <p>Amount: {minLoanAmount.value ? minLoanAmount.value + " ETH": "EMPTY"}</p>
              <p>Duration: {duration.value ? duration.value + " Hrs": "EMPTY"}</p>
              <p>Interest: {maxInterest.value ? maxInterest.value + " %": "EMPTY"}</p>
              <p>Repayment Period: {minRepaymentPeriod.value ? minRepaymentPeriod.value + " Days": "EMPTY"}</p>
            </div>

            <ul>
                <li>
                    <Button
                        onClick={onBack}
                        className="button"
                    >
                        &#x2190; Edit
                    </Button>
                    <Button
                        onClick={handleSubmitPost}
                        className="button"
                    >
                        Create Auction
                    </Button>
                </li>
            </ul>
          </div>         

        </Carousel>
      </CreatePostWrapper>
    );
};

export default CreatePost;
