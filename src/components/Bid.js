import React from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import Avatar from "../styles/Avatar";

const BidWrapper = styled.div`
  .bid-container {
    display: grid;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin: 1rem;

    grid-template-columns: 4fr 3fr 3fr 3fr;
    grid-template-areas:
      "username amount duration interest";

    border: 1px solid black;
    border-radius: 0.5rem;
    box-shadow: 2px 2px 10px gray;
  }

  .bid-field {
    padding: 0.5rem 1rem 0.5rem 1rem;
    border-right: 1px solid black;
    text-align: center;
  }

  .username {
    font-size: larger;
  }

  .amount {
    grid-area: amount;
  }

  .duration {
    grid-area: duration;
  }

  .interest {
    grid-area: interest;
  }
  

`;

const Bid = ({ user, amount, duration, interest, time, bidId }) => {
    const history = useHistory();

    return (
        <BidWrapper>
            <div className="bid-container">
                <span
                    className="bold bid-field username"
                >
                  {user.substr(0,8)}
                </span>
                <div className="bid-field amount">{amount} ETH</div>
                <div className="bid-field duration">{duration} Days</div>
                <div className="bid-field interest">{interest} %</div>
            </div>
        </BidWrapper>
    );
};

export default Bid;
