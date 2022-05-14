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

export const CreateNFTWrapper = styled.div`
  
  .modal {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    transition: transform 0.3s;
  }
  
  .modal-page {

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
  
  #create-nft-page {
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
  
  #create-nft-page > h1 {
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

const CreateNFT = ({open, onClose}) => {

    // stores inputs
    const imageURI = useInput("");
    const description = useInput("");   

    // if modal is not open, return null
    if (!open) return null;

    const handleSubmitPost = () => {
        // all fields must be filled
        if (!(imageURI.value && description.value )) {
            return toast.error("Please write something");
        }

        toast.success("Your post has been submitted successfully");
    }

  return (
    <CreateNFTWrapper>
        {/* Blur rest of screen */}
        <div className="fill-page"></div>

        {/* Create Auction Page (Page 1) */}
        <div className="modal-page" id="create-nft-page">
            <div className="header">                
                <div><span>CREATE NFT</span></div>
            </div>
            <h1>
                <span className="caption">
                    <textarea
                        placeholder="Image URI"
                        value={imageURI.value}
                        onChange={imageURI.onChange}
                    />
                </span>
                <span className="caption">
                    <textarea
                        placeholder="Description"
                        value={description.value}
                        onChange={description.onChange}
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
                        onClick={handleSubmitPost}
                        className="button"
                    >
                        Create
                    </Button>
                </li>
            </ul>
        </div>

    </CreateNFTWrapper>
  )
}

export default CreateNFT