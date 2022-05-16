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

let selectedUser;

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
            await window.ethereum.enable()
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
    console.log(selectedUser)

       
    return selectedUser
}

export const initContracts = async () => {
    let provider = window.ethereum;

    const web3 = new Web3(provider);
    const networkId = await web3.eth.net.getId();
    console.log(networkId)

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

// NFT Manager Functions
export const createToken = (tokenURI) => {
    NFTManagerContract.methods.createToken(tokenURI).send({ from: selectedUser });
}

export const getLatestId = () => {
    NFTManagerContract.methods.getLatestId();
}

// NFT Marketplace Functions
export const lockNFT = (addressNFTManager, tokenId) => {
    NFTMarketplaceContract.methods.lockNFT(addressNFTManager, tokenId).send({ from: selectedUser });
}

// Blind Auction Functions
export const startAuction = (minLoanAmount, maxInterestRate, minRepaymentPeriod, auctionDuration, NFTContractAddress, tokenId) => {
    BlindAuctionContract.methods.startAuction(
        minLoanAmount, maxInterestRate, minRepaymentPeriod, NFTContractAddress, tokenId, auctionDuration
    ).send({ from: selectedUser });
}

export const makeBid = (loanAmount, interestRate, repaymentPeriod, isFake, NFTContractAddress, tokenId) => {
    BlindAuctionContract.methods.makeBid(
        loanAmount, interestRate, repaymentPeriod, isFake, NFTContractAddress, NFTContractAddress, tokenId
    ).send({ from: selectedUser });
}

export const selectWinningBid = (selectedLender, bidId, NFTContractAddress, tokenId, LoanContractAddress) => {
    BlindAuctionContract.methods.selectBid(
        selectedLender, bidId, NFTContractAddress, tokenId, LoanContractAddress
    ).send({ from: selectedUser });
}

export const getAllAuctionObjects = async () => {
    if (!isUserInitialized) await initUser()
    if (!isContractInitialized) await initContracts();

    return BlindAuctionContract.methods.getAllAuctionObjects().call();
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

