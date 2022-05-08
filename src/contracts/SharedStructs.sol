// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;


library SharedStructs {
    struct loanArgs {
        address payable lender; // owner of capital
        address payable borrower; // owner of NFT
        uint NFTtokenID;
        address NFTtokenAddress;
        uint loanAmount;  // principal/capital of loan
        uint interestRate;  // interest rate per month
        uint loanDuration; // number of days
  }
}