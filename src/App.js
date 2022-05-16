import React, {useContext, useEffect, useState} from "react";
import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {ThemeProvider as StyledThemeProvider} from "styled-components";
import GlobalStyle from "./styles/GlobalStyle";
import Routing from "./Routing";
import {UserContext} from "./context/UserContext";
import {ThemeContext} from "./context/ThemeContext";
import { initUser, initContracts } from "./utils/Web3Client";

import Web3 from 'web3'
import {user1} from "./utils/FakeBackend";
import {client} from "./utils";
import Loader from "./components/Loader";

const App = () => {
    const {user, setUser} = useContext(UserContext);
    const {theme} = useContext(ThemeContext);

    const [loading, setLoading] = useState(true);
    const [constructorHasRun, setConstructorHasRun] = useState(false);

    useEffect(async () => {
        if (constructorHasRun) return;

        setUser({
            "address" : await initUser()
        });
        initContracts();

        setLoading(false);
        setConstructorHasRun(true);
    }, [])
    
    if (loading) {
        return <Loader />;
    }

    return (
        <StyledThemeProvider theme={theme}>
            <GlobalStyle/>
            <ToastContainer autoClose={1000} closeButton={false}/>
            <Routing/>
        </StyledThemeProvider>
    );
};

export default App;
