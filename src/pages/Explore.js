import React, { useState, useEffect, useContext } from "react";
import styled from "styled-components";
import PostPreview from "../components/PostPreview";
import AuctionPreview from "../components/AuctionPreview";
import Loader from "../components/Loader"; 
import { client } from "../utils";
import Posts from "../contracts/Posts.sol";
import {toast} from "react-toastify";
import Search from "../components/Search";
import {UserContext} from "../context/UserContext";
import {FeedContext} from "../context/FeedContext";
import BedtimeOutlinedIcon from '@mui/icons-material/BedtimeOutlined';
import Web3 from 'web3'
import {user1} from "../utils/FakeBackend";

import { getAllAuctionObjects, getTokenURI } from "../utils/Web3Client";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    font-size: xx-large;
    font-weight: bold;
    left: 50%;
  }

  .search {
    padding: 1rem;
  }
`;

const Explore = () => {
  const { setUser } = useContext(UserContext);
  const { feed, setFeed } = useContext(FeedContext);
  const [auctions, setAuctions] = useState([])

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    getAllAuctionObjects()
      .then(res => {
        console.log(res)
        setAuctions(res.filter(auction => !auction.auctionEnded))
        setLoading(false);
      })
      .catch(err => {
        console.log(err)
        setLoading(false);
      })

  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <Wrapper>
      <h2>Explore</h2>
      <div className="search">
        <Search />
      </div>
      
      {auctions?.length > 0 ?
        <AuctionPreview auctions={auctions} />
        :
        <>
          <BedtimeOutlinedIcon style={{"fontSize": "200px"}}/>
          <em>NOT MUCH HAPPENING...</em>
        </>
      }
      
    </Wrapper>
  );
};

export default Explore;
