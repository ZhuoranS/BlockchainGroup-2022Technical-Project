import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from "react-router-dom";
import { client } from "../utils";
import Button from '../styles/Button';
import styled from "styled-components";
import {toast} from "react-toastify";

import Bid from '../components/Bid';

export const SelectBidWrapper = styled.div`

  .bid-select-container {
    display: grid;
    border: 1px solid lightgray;
    border-radius: 0.5rem;
    margin: 1rem;
  }

  .select-button {
    border: none;
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
  const { postAddress } = useParams();

  useEffect(() => {
    client(`/posts/${postAddress}`)
      .then((res) => {
        setBids(res.data.bidHistory);
      })
      .catch((err) => setDeadend(true));
  }, [postAddress]);

  const handleSelect = () => {
    toast.error("Select Winning Bid functionality not added yet");
  }

  return (
    <div>
      <h1>Select the Winning Bid</h1>
      {bids.map((bid) => (
        <SelectBidWrapper>
          <div className="bid-select-container">
            <Bid user={bid.user} amount={bid.amount} duration={bid.duration} interest={bid.interest} />
            <Button 
              className="select-button" 
              secondary
              onClick={() => handleSelect()}>Select Bid</Button>
          </div>
        </SelectBidWrapper>
      ))}
    </div>
  )
}

export default SelectBid