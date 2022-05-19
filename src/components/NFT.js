import React from 'react';
import styled from 'styled-components';

export const NFTWrapper = styled.div`
  height: 100%;
  width: 100%;
  border-radius: 4px;
  background: ${(props) => props.theme.white};

  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;

  overflow-y: scroll;

  .nft-img {
    min-height: 75%;
    max-height: 75%;
    border-radius: 4px;
  }
  
  .nft-name {
    height: 10%;
  }
  
  .nft-description { 
    padding: 0 1rem;
    font-size: smaller;
    text-align: center;
    height: 15%;
  }


`;

const NFT = ({ nft }) => {
  return (
    <NFTWrapper>
      <div className="nft-img">
        <img src={nft.image}></img>
      </div>
      <div className="nft-name">
        <strong>{nft.name}</strong>
      </div>
      <div className="nft-description">
        <em>{nft.description}</em>
      </div>
    </NFTWrapper>
  )
}

export default NFT