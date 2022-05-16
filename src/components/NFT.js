import React from 'react';
import styled from 'styled-components';

export const NFTWrapper = styled.div`
  height: 100%;
  width: 100%;
  border-radius: 4px;
  background: ${(props) => props.theme.white};
  border: 1px solid ${(props) => props.theme.blue};

  /* display: grid;
  grid-template-rows: 2fr 1fr 1fr;
  grid-template-columns: auto;
  grid-template-areas:
    "nftImg"
    "nftName"
    "nftDescription"; */

  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  overflow-y: scroll;

  img {
      min-height: 70%;
  }
`;

const NFT = ({ nft }) => {
  return (
    <NFTWrapper>
        <img src={nft.image}></img>
        <strong>{nft.name}</strong>
        <em>{nft.description}</em>
    </NFTWrapper>
  )
}

export default NFT