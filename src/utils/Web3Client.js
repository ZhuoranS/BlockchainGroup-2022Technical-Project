import React, {useContext, useEffect, useState} from "react";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {UserContext} from "../context/UserContext";

import BlindAuction from '../abis/BlindAuction.json';
import Migrations from '../abis/Migrations.json';
import NFTManager from '../abis/NFTManager.json';
import NFTMarketplace from '../abis/NFTMarketplace.json';
import P2PLoan from '../abis/P2PLoan.json';
import Posts from '../abis/Posts.json';

import Web3 from 'web3';
import { fetchTokenInfo } from './Utils'

let provider = window.ethereum;

let selectedUser;
let userNFTs;

let isUserInitialized = false;
let isContractInitialized = false;

let NFTMarketplaceContract;
let NFTManagerContract;
let BlindAuctionContract;
let P2PLoanContract;

export const initUser = async () => {
    const loadWeb3 = async () => { 
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum)
            await window.ethereum.request({ method: 'eth_requestAccounts'})

            window.ethereum.on('accountsChanged', (accounts) => {
                console.log(accounts)
            })
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider)
        }
        else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    }

    const loadAddress = async () => {
        const web3 = window.web3
        // make sure app is connected to blockchain
        const accounts = await web3.eth.getAccounts()
        if (typeof accounts[0] === 'string' && accounts[0] !== '') {
            toast.success(`app login success ${accounts[0]}`);
            let user = accounts[0]

            return user;
        }

        return null;
    }

    const fetchData = async () =>{
        await loadWeb3();
        let user = await loadAddress();
        return user;
    }

    isUserInitialized = true;

    selectedUser = await fetchData();
    const userData = {
        "address": selectedUser,
        "userNFTs": await initUserNFTs(selectedUser),
        "avatar": "https://www.w3schools.com/css/img_lights.jpg",
        "isMe": true,
        "username": "USERNAME",
        "ownedLiveAuctions": await initUserOwnedLiveAuctions(selectedUser),
        "bidAuctions": await initUserBidAuctions(selectedUser),
    }

    localStorage.setItem("user", JSON.stringify(userData))
   
    return userData
}

export const initUserNFTs = async (user) => {
    const getOwnedNFTs = async (currLatestId) => {
        let ownedNFTs = [];

        for (let i = 1; i <= currLatestId; i++) {
            
            if ((await ownerOf(i)) == user) {
                try {
                    let tokenInfo = await fetchTokenInfo(i);

                    ownedNFTs.push(
                        {
                        "tokenId": i,
                        "tokenInfo": JSON.parse(tokenInfo)
                        }
                    )
                } catch {
                    continue;
                }
            }
        }

        return ownedNFTs;
    }

    const latestId = (await getLatestId()).toNumber()
    userNFTs = await getOwnedNFTs(latestId);

    return userNFTs
}

export const initUserOwnedLiveAuctions = async (user) => {

    const allAuctionObjects = await getAllAuctionObjects();
    console.log(allAuctionObjects)
    let ownedAuctionObjects = [];

    for (let i = 0; i < allAuctionObjects.length; i++) {
        let currAuctionObj = allAuctionObjects[i]

        if (currAuctionObj.auctionEnded) continue;
        if (!(currAuctionObj.beneficiary == user)) continue;

        ownedAuctionObjects.push(currAuctionObj.NFT_tokenID)
    }

    return ownedAuctionObjects
}

export const initUserBidAuctions = async (user) => {
    const allAuctionObjects = await getAllAuctionObjects();
    let bidAuctions = [];

    for (let i = 0; i < allAuctionObjects.length; i++) {
        let currAuctionObj = allAuctionObjects[i]

        if (currAuctionObj.auctionEnded) continue;

        for (let bid of currAuctionObj.revealedBids) {
            if (bid.bidder_address == user) {
                bidAuctions.push(currAuctionObj.NFT_tokenID);
                break;
            }
        }

    }

    return bidAuctions
}

export const initAuctions = async () => {
    const auctions = await getAllAuctionObjects();
    const networkId = await initNetworkId();
    const addressNFTManager = NFTManager.networks[networkId].address;

    for (let auction of auctions) {
        let currTime = new Date().getTime() / 1000
        
        try {
            if (currTime >= auction.auctionEndTime) {
                // auction alrady ended
                console.log(auction.NFT_tokenID)
                await endAuction(addressNFTManager, auction.NFT_tokenID)
            }
        } catch {
            console.log("ERROR with ending auction")
        }

    }
}

export const initNetworkId = async () => {
    const web3 = new Web3(provider);
    const networkId = await web3.eth.net.getId();

    localStorage.setItem("networkId", JSON.stringify(networkId));

    return networkId
}

export const initContracts = async () => {

    const web3 = new Web3(provider);
    const networkId = await initNetworkId();

    NFTMarketplaceContract = new web3.eth.Contract(
        NFTMarketplace.abi, 
        NFTMarketplace.networks[networkId].address
    );

    NFTManagerContract = new web3.eth.Contract(
        NFTManager.abi,
        NFTManager.networks[networkId].address
    )

    BlindAuctionContract = new web3.eth.Contract(
        BlindAuction.abi, 
        BlindAuction.networks[networkId].address
    );

    P2PLoanContract = new web3.eth.Contract(
        P2PLoan.abi,
        P2PLoan.networks[networkId].address
    )

    isContractInitialized = true;
}

//decorator (currently not supported)
const waitInit = () => {
    return async function (target) {
        if (!isUserInitialized) await initUser();
        if (!isContractInitialized) await initContracts();
    }
}

// NFT Manager Functions
export const createToken = (tokenURI) => {
    return NFTManagerContract.methods.createToken(tokenURI).send({ from: selectedUser });
}

export const approve = (addressNFTMarketplace, tokenId) => {
    return NFTManagerContract.methods.approve(addressNFTMarketplace, tokenId).send({ from: selectedUser });
}

export const getLatestId = async () => {
    if (!isUserInitialized) await initUser();
    if (!isContractInitialized) await initContracts();

    return NFTManagerContract.methods.getLatestId().call();
}

export const ownerOf = async (tokenId) => {
    if (!isUserInitialized) await initUser();
    if (!isContractInitialized) await initContracts();

    return NFTManagerContract.methods.ownerOf(tokenId).call()
}

export const getTokenURI = async (tokenId) => {
    if (!isUserInitialized) await initUser();
    if (!isContractInitialized) await initContracts();

    return NFTManagerContract.methods.tokenURI(tokenId).call();
}

// NFT Marketplace Functions
export const lockNFT = (addressNFTManager, tokenId) => {
    return NFTMarketplaceContract.methods.lockNFT(addressNFTManager, tokenId).send({ from: selectedUser });
}

// Blind Auction Functions
export const startAuction = (minLoanAmount, maxInterestRate, minRepaymentPeriod, auctionDuration, addressNFTManager, tokenId) => {
    return BlindAuctionContract.methods.startAuction(
        minLoanAmount, maxInterestRate, minRepaymentPeriod, addressNFTManager, tokenId, auctionDuration
    ).send({ from: selectedUser });
}

export const makeBid = (loanAmount, interestRate, repaymentPeriod, isFake, addressNFTManager, tokenId) => {
    return BlindAuctionContract.methods.makeBid(
        loanAmount, interestRate, repaymentPeriod, isFake, addressNFTManager, tokenId
    ).send({ from: selectedUser });
}

export const selectWinningBid = (selectedLender, bidId, tokenId, addressNFTManager, LoanContractAddress) => {
    return BlindAuctionContract.methods.selectBid(
        selectedLender, bidId, addressNFTManager, tokenId, LoanContractAddress
    ).send({ from: selectedUser });
}

// @waitInit()
export const getAllAuctionObjects = async () => {
    if (!isUserInitialized) await initUser();
    if (!isContractInitialized) await initContracts();

    return BlindAuctionContract.methods.getAllAuctionObjects().call();
}

export const getAuctionObject = async (addressNFTManager, tokenId) => {
    if (!isUserInitialized) await initUser();
    if (!isContractInitialized) await initContracts();

    return BlindAuctionContract.methods.getAuctionObject(addressNFTManager, tokenId).call();
}

export const endAuction = async (addressNFTManager, tokenId) => {
    if (!isUserInitialized) await initUser();
    if (!isContractInitialized) await initContracts();

    return BlindAuctionContract.methods.endAuction(addressNFTManager, tokenId).call();
}

// P2P Loan Functions

export const createLoan = (addresses, uints) => {
    P2PLoanContract.methods.createLoan(addresses, uints)
}

export const repayLoan = (loanId) => {
    P2PLoanContract.methods.repayLoan(loanId).send({ from: selectedUser });
}

export const loanDefaulted = (loanId) => {
    P2PLoanContract.methods.loanDefaulted(loanId)
}

