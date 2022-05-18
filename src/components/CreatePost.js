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
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";

import { approve, lockNFT } from "../utils/Web3Client";

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
    padding: 5rem;

    overflow: hidden;
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
    const caption = useInput("");
    const address = useInput();
    const amount = useInput();
    const duration = useInput();
    const interest = useInput();    

    // if modal is not open, return null
    if (!open) return null;

    // TODO: implement minting function
    const handleSubmitPost = async () => {
        // all fields must be filled
        if (!(address.value && amount.value && duration.value && interest.value)) {
            return toast.error("Please write something");
        }

        if (!selectedNFT) {
          return toast.error("Please choose an NFT");
        }

        const networkId = localStorage.getItem("networkId")

        const addressNFTManager = NFTManager.networks[networkId].address;
        const addressNFTMarketplace = NFTMarketplace.networks[networkId].address;

        await approve(addressNFTMarketplace, selectedNFT.tokenId)
        await lockNFT(addressNFTManager, selectedNFT.tokenId)

        toast.success("Your post has been submitted successfully");

        // OLD CODE -- commented out b/c the pseudo API call might be useful later
        /*const tags = caption.value
            .split(" ")
            .filter((caption) => caption.startsWith("#"));

        const cleanedCaption = caption.value
            .split(" ")
            .filter((caption) => !caption.startsWith("#"))
            .join(" ");

        caption.setValue("");

        const newPost = {
            caption: cleanedCaption,
            files: [postImage],
            tags,
        };

        client(`/posts`, { body: newPost }).then((res) => {
            const post = res.data;
            post.isLiked = false;
            post.isSaved = false;
            post.isMine = true;
            setFeed([post, ...feed]);
            window.scrollTo(0, 0);
            toast.success("Your post has been submitted successfully");
        });*/
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
                            width: "100%"
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
            <h1>
              <span className="caption">
                  <textarea
                      placeholder="Address"
                      value={address.value}
                      onChange={address.onChange}
                  />
              </span>
              <span className="caption">
                  <textarea
                      placeholder="Amount"
                      value={amount.value}
                      onChange={amount.onChange}
                  />
              </span>
              <span className="caption">
                  <textarea
                      placeholder="Duration"
                      value={duration.value}
                      onChange={duration.onChange}
                  />
              </span>
              <span className="caption">
                  <textarea
                      placeholder="Interest"
                      value={interest.value}
                      onChange={interest.onChange}
                  />
              </span>
            </h1>

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
            <p>Address: {address.value ? address.value : "EMPTY"}</p>
            <p>Amount: {amount.value ? amount.value : "EMPTY"}</p>
            <p>Duration: {duration.value ? duration.value : "EMPTY"}</p>
            <p>Interest: {interest.value ? interest.value : "EMPTY"}</p>

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
