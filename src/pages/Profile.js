import React, { useEffect, useState, useContext } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import PostPreview from "../components/PostPreview";
import ProfileHeader from "../components/ProfileHeader";
import Placeholder from "../components/Placeholder";
import Loader from "../components/Loader";
import { PostIcon, SavedIcon, NewPostIcon } from "../components/Icons";
import { client } from "../utils";
import ExpandedPost from "../components/ExpandedPost"
import CreatePost from "../components/CreatePost"
import Post from "../components/Post";
import {post1} from "../utils/FakeBackend";
import { UserContext } from "../context/UserContext";
import NFTPreview from "../components/NFTPreview";

import { getTokenURI, ownerOf, getLatestId } from "../utils/Web3Client";

const Wrapper = styled.div`
  
  .profile-tab {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    margin: 1.4rem 0;
  }

  .profile-tab div {
    display: flex;
    cursor: pointer;
    margin-right: 3rem;
  }

  .profile-tab span {
    padding-left: 0.3rem;
  }

  .profile-tab svg {
    height: 24px;
    width: 24px;
  }

  hr {
    border: 0.5px solid ${(props) => props.theme.borderColor};
  }
  
`;

const Profile = () => {
  const [tab, setTab] = useState("BIDS");

  const { address } = useParams();
  const {user} = useContext(UserContext);
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [deadend, setDeadend] = useState(false);

  const [userNFTs, setUserNFTs] = useState([])
  const [latestId, setLatestId] = useState(-1)

  const getOwnedNFTs = async (currLatestId) => {
    let ownedNFTs = [];
    console.log(user.address)
    console.log(currLatestId)

    for (var i = 1; i <= currLatestId; i++) {
      let tokenURI = await getTokenURI(i)
      
      if ((await ownerOf(i)) == user.address) {
        ownedNFTs.push(
          {
            "tokenId": i,
            "tokenInfo": (await (await fetch(tokenURI)).json())
          }
        )
      }
    }

    return ownedNFTs;
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    client(`/${address}`)
      .then((res) => {
        setLoading(false);
        setDeadend(false);
        setProfile(res.data);
      })
      .catch((err) => setDeadend(true));

    getLatestId()
      .then(async (res) => {
        setLatestId(res.toNumber());
        setUserNFTs(await getOwnedNFTs(res.toNumber()));
      })
    
  }, [address]);

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
      <ProfileHeader profile={profile} />
      <hr />

      <div className="profile-tab">
        <div
          style={{ fontWeight: tab === "BIDS" ? "500" : "" }}
          onClick={() => setTab("BIDS")}
        >
          <SavedIcon  icon="BIDS" tabId={tab}/>
          <span>Bids</span>
        </div>
        <div
          style={{ fontWeight: tab === "BORROW" ? "500" : "" }}
          onClick={() => setTab("BORROW")}
        >
          <SavedIcon  icon="BORROW" tabId={tab}/>
          <span>Borrow</span>
        </div>
        <div
            style={{ fontWeight: tab === "LEND" ? "500" : "" }}
            onClick={() => setTab("LEND")}
        >
          <SavedIcon   icon="LEND" tabId={tab}/>
          <span>Lend</span>
        </div>
        <div
            style={{ fontWeight: tab === "HISTORY" ? "500" : "" }}
            onClick={() => setTab("HISTORY")}
        >
          <SavedIcon    icon="HISTORY" tabId={tab}/>
          <span>History</span>
        </div>
        <div
            style={{ fontWeight: tab === "MY_NFTS" ? "500" : "" }}
            onClick={() => setTab("MY_NFTS")}
        >
          <SavedIcon    icon="MY_NFTS" tabId={tab}/>
          <span>My NFT's</span>
        </div>
        
      </div>

      {tab === "BIDS" && (
        <>
          {profile?.bidPosts?.length === 0 ? (
            <Placeholder
              title="Bids"
              text="Once you start making bids, they'll appear here"
              icon="post"
            />
          ) : (
            // TODO: make sure to return only posts for bidding
            <PostPreview posts={profile?.bidPosts} />
          )}
        </>
      )}

      {tab === "BORROW" && (
        <>
          {profile?.borrowPosts?.length === 0 ? (
            <Placeholder
              title="Borrow"
              text="Borrow nfts will appear here"
              icon="bookmark"
            />
          ) : (
            <div>
              {/* TODO: make sure to return only posts user has borrowed */}
              <PostPreview posts={profile?.borrowPosts} />

            </div>
          )}
        </>
      )}

      {tab === "LEND" && (
          <>
            {profile?.loanPosts?.length === 0 ? (
                <Placeholder
                    title="Lend"
                    text="Lend nfts will appear here"
                    icon="bookmark"
                />
            ) : (
                <div>
                  {/* TODO: make sure to return only posts user has lent */}
                  <PostPreview posts={profile?.loanPosts} active={false}/>

                </div>
            )}
          </>
      )}

      {tab === "HISTORY" && (
          <>
            {profile?.history?.length === 0 ? (
                <Placeholder
                    title="History"
                    text="Completed loans will show here"
                    icon="bookmark"
                />
            ) : (
                <div>
                  {/* TODO: make sure to return only posts user has already completed */}
                  {profile?.history?.map((post) => (
                      <ExpandedPost key={post._id} prop_post={post} />
                  ))}
                </div>
            )}
          </>
      )}

      {tab === "MY_NFTS" && (
        <>
          {userNFTs.length === 0 ? (
              <Placeholder
                  title="My NFT's"
                  text="Minted NFT's will show here"
                  icon="bookmark"
              />
          ) : (
              <div>
                <NFTPreview nfts={userNFTs} />

              </div>
          )}
        </>
      )}

    </Wrapper>
  );
};

export default Profile;
