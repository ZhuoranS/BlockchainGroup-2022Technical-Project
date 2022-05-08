import React, { useState, useContext, useEffect } from "react";
import styled from "styled-components";
import { useHistory, useParams } from "react-router-dom";
import {toast} from "react-toastify";
import Loader from "../components/Loader";
import Button from "../styles/Button";
import {UserContext} from "../context/UserContext"
import { client } from "../utils";

export const PostWrapper = styled.div`
  width: 900px;
  background: ${(props) => props.theme.white};
  border: 1px solid ${(props) => props.theme.white};
  margin-bottom: 1.5rem;
  padding: 0.5rem;

  .post-header-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .post-header {
    display: flex;
    align-items: center;
    padding: 1rem;
  }

  .post-header h3 {
    cursor: pointer;
  }

  .post-img {
    width: 500px;
    height: 100%;
    border-radius: 8px;
  }

  .username {
    padding-right: 0.3rem;
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
  
  h1 {
    margin-left: 1rem;
  }
  
  span {
    width: 300px
  }
  
  button {
    width: 100%;
    margin: 20px;
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

const ExpandedPost = () => {
    const history = useHistory();
    const { postAddress } = useParams();
    const [loading, setLoading] = useState(true);
    const [deadend, setDeadend] = useState(false);
    const {user} = useContext(UserContext);
    const [post, setPost] = useState()
    const [bids, setBids] = useState([]);

    useEffect(() => {
      client(`/posts/${postAddress}`)
        .then((res) => {
          setPost(res.data);
          setBids(res.data.bidHistory);
          setLoading(false);
          setDeadend(false);
        })
        .catch((err) => setDeadend(true));
    }, [postAddress]);

    if (!deadend && loading) {
      return <Loader />;
    }

    return (
        <PostWrapper>
            <ul>
                <li>
                    <img
                        className="post-img"
                        src={post.file}
                        alt="post-img"
                    />
                </li>
                <li>
                    <h1>
                            <span className="caption bold">
                                {post.title}
                            </span>
                    </h1>
                    <ul>
                        <li>
                            { post.user === user.address ? (
                                <p>Borrower</p>
                            ) : (
                                <p>Lender</p>
                            )}
                            <p>loan amount</p>
                            <p>start date</p>
                            <p>end date</p>
                            <p>status</p>
                        </li>
                        <li>
                            <p>:</p>
                            <p>:</p>
                            <p>:</p>
                            <p>:</p>
                            <p>:</p>
                        </li>
                        <li>
                            <p
                                className="pointer"
                                onClick={() => history.push(`/${post.user}`)}
                            >
                                <span className="secondary">
                                    {post.user.substr(0,8)}
                                </span>
                            </p>
                            <p>
                                <span className="secondary">
                                   {post.price} ETH
                                </span>
                            </p>
                            <p>
                                <span className="secondary">
                                    {post?.startDate}
                                </span>
                            </p>
                            <p>
                                <span className="secondary">
                                    {post?.endDate}
                                </span>
                            </p>
                            <p>
                                <span className="secondary">
                                    {post?.status}
                                </span>
                            </p>
                        </li>
                    </ul>
                    <ul>
                        <li>
                            { post?.status === "on loan" && post?.borrower === user.address ?
                                (
                                <div>
                                  <Button
                                    secondary
                                    onClick={() => toast.success("function not added")}
                                  >
                                      Repay
                                  </Button>
                                </div>
                                ) : (
                                    <div> </div>
                                )
                            }
                            { post?.status === "on loan" ?
                                (
                                <div>
                                  <Button 
                                      secondary 
                                      onClick={() => history.push(`/p/${post.address}`)}
                                  >
                                    View Completed Auction
                                  </Button>
                                </div>
                                ) : (
                                    <div> </div>
                                )
                            }      
                            <Button onClick={() => history.goBack()}>&#x2190; Go Back</Button>                           
                        </li>
                    </ul>
                </li>
            </ul>
        </PostWrapper>
    );
};

export default ExpandedPost;
