import React, {useContext, useEffect, useState} from "react";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {UserContext} from "../context/UserContext";

import Web3 from 'web3';

export const init = () => {

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

    return fetchData();
}