// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.3;
// import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
// import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
// import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "abdk-libraries-solidity/ABDKMath64x64.sol";
import "./NFTMarketplace.sol";

import "@openzeppelin/contracts/utils/Strings.sol";

contract P2PLoan {
  
  // ============ Structs ============

  // attaches SafeMath lib to uint datatype
  using SafeMath for uint; 

  enum Status { ACTIVE, ENDED, DEFAULTED }

  // NFT loan post struct
  struct Loan {
    uint loanID;
    address payable lender; // owner of capital
    address payable borrower; // owner of NFT
    uint NFTtokenID;
    address NFTtokenAddress;
    uint loanAmount;  // principal/capital of loan
    uint totalAmountDue; //loan amount + interest
    uint interestRate;  // interest rate per month
    uint loanCreatedTimeStamp; // unix time
    uint loanDuration; // number of days
    uint loanCompleteTimeStamp; // unix time
    Status status;
  }

  // struct loanArgs {
  //   address payable lender; // owner of capital
  //   address payable borrower; // owner of NFT
  //   uint NFTtokenID;
  //   address NFTtokenAddress;
  //   uint loanAmount;  // principal/capital of loan
  //   uint interestRate;  // interest rate per month
  //   uint loanDuration; // number of days
  // }

  // ============ Mutable Storage ============

  // total number of loans created
  uint public numOfLoans;
  // map from loanID to loan instances
  mapping(uint => Loan) public allLoans;
  // map userID to loans on borrow
  mapping(address => uint[]) public userBorrow; 
  // map user to loans on lend
  mapping(address => uint[]) public userLend; 
  // owner of the contract
  address public owner;


  // ============ Events ============

  event LoanCreated(
    uint id,
    address indexed owner,
    address borrower,
    uint tokenId,
    address tokenAddress,
    uint loanAmount,
    uint totalAmountDue,
    uint interestRate,
    uint loanCreatedTimeStamp,
    uint loanDuration,
    uint loanCompleteTimeStamp
  );

  // Loan drawn by NFT owner
  event LoanDrawn(uint id, address lender, uint amountDrawn);
  // Loan repayed by address
  event LoanRepayed(uint id, address repayer, uint amountRepayed);
  // NFT seized by lender
  event LoanDefault(uint id, address caller);
  // logging address
  event logAddress(address caller);
  // console.Log for debuggin in soliditiy 
  event consoleLog(string msg, uint num);

  // ============ Modifiers ============

  // checking if a loan is valid
  modifier isValidLoanID(uint loanID) {
          require(
              loanID < numOfLoans,
              "Loan ID is invalid."
          );
          _;
      }
  
  constructor() public {
      owner = msg.sender;
      numOfLoans = 0;
      emit logAddress(msg.sender);
  }

  // ============ Functions ============

  /**
    creates a new loan object 
   */
  function createLoan(
      address[3] memory addresses, // lender, borrower, nft token address
      uint[4] memory uints // nft token id, loan amount, interest rate, loan duration
    ) external returns(uint _numOfLoans) {
    // address payable lender = payable(addresses[0]); 
    // address payable borrower = payable(addresses[1]);
    // address NFTtokenAddress = address(addresses[2]);

    // uint NFTtokenID = uints[0];
    // uint loanAmount = uints[1];
    // uint interestRate = uints[2];
    // uint loanDuration = uints[3]; 

    require(uints[2] <= 100, "Interest must be lower than 100%.");
    require(uints[3] > 0, "Can't create loan in past");
    require(uints[3] <= 360, "Max loan period is 12 months/360 days");
    require(uints[3] % 30 == 0, "loan period must be in 30 day intervals");

    uint durationInUnix = SafeMath.mul(uints[3], 86400);
    uint _loanCompleteTimeStamp = SafeMath.add(durationInUnix, block.timestamp);
    uint diff = SafeMath.sub(_loanCompleteTimeStamp, block.timestamp);
    require( diff >= durationInUnix, "can't create loan in the past");

    // calculate total payment due
    uint numOfMonths = SafeMath.div(uints[3], 30);
    uint totalInterestRate =  SafeMath.mul(numOfMonths, uints[2]);
    uint totalInterestDue = SafeMath.mul(totalInterestRate, uints[1]);
    int128 realInterestDue = ABDKMath64x64.divu(totalInterestDue, 100);
    uint unsignedRealInterestDue = ABDKMath64x64.toUInt(realInterestDue);
    uint _totalAmountDue = SafeMath.add(unsignedRealInterestDue, uints[1]);

    // add loan to allLoans array 
    allLoans[numOfLoans] = Loan({
      loanID: numOfLoans,
      lender: payable(addresses[0]),
      borrower: payable(addresses[1]),
      NFTtokenID: uints[0],
      NFTtokenAddress: address(addresses[2]),
      loanAmount: uints[1],
      totalAmountDue: _totalAmountDue,
      interestRate: uints[2],
      loanCreatedTimeStamp: block.timestamp,
      loanDuration: uints[3],
      loanCompleteTimeStamp: _loanCompleteTimeStamp,
      status: Status.ACTIVE
    });

    // store loan id in user arrays for easier read access
    userBorrow[payable(addresses[1])].push(numOfLoans);
    userLend[payable(addresses[0])].push(numOfLoans);

    // adjust nums of loans according and emit event
    numOfLoans = SafeMath.add(numOfLoans, 1);
    uint index = SafeMath.sub(numOfLoans, 1);
    Loan storage l = allLoans[index];

    emit LoanCreated(
      allLoans[index].loanID,
      l.lender,
      l.borrower,
      l.NFTtokenID,
      l.NFTtokenAddress,
      l.loanAmount,
      l.totalAmountDue,
      l.interestRate,
      l.loanCreatedTimeStamp,
      l.loanDuration,
      l.loanCompleteTimeStamp
    );

    return numOfLoans;
  }

  /**
    Enables lender to reclaim NFt by paying borrower (always pay in full)
   */
  function repayLoan(uint _loanID) external payable {
    Loan storage loan = allLoans[_loanID];
    // Prevent repaying repaid loan
    require(loan.status == Status.ACTIVE, "Can't repay paid or defaulted loan.");
    // Prevent repaying loan after expiry
    require(loan.loanCompleteTimeStamp >= block.timestamp, "cannot repay. Loan has expired.");
    // must be borrower to repay loan
    require(loan.borrower == msg.sender, "only borrower can repay loan");
    // must pay in full
    require(msg.value >= loan.totalAmountDue, "Must pay in full.");

    // pay borrower
    loan.lender.transfer(loan.totalAmountDue);    

    NFTMarketplace nftMarketplace = NFTMarketplace(loan.NFTtokenAddress);
    nftMarketplace.unlockNFT(loan.NFTtokenAddress, loan.NFTtokenID, loan.borrower);

    // change loan status to ended
    loan.status = Status.ENDED;
    
    // Emit repayment event 
    emit LoanRepayed(_loanID, msg.sender, msg.value);
  }

  /**
    Allows borrowers to seize nft if loan not paid on time
   */
  function loanDefaulted(uint256 _loanID) external isValidLoanID(_loanID){
    Loan storage loan = allLoans[_loanID];
    // Prevent repaying repaid loan
    require(loan.status == Status.ACTIVE, "Can't default paid or already defaulted loan.");
    // Prevent repaying loan after expiry
    require(loan.loanCompleteTimeStamp < block.timestamp, "Can't default active loans.");
    // must be lender to default loan
    require(loan.lender == msg.sender, "only lender can default loan");

    NFTMarketplace nftMarketplace = NFTMarketplace(loan.NFTtokenAddress);
    nftMarketplace.unlockNFT(loan.NFTtokenAddress, loan.NFTtokenID, loan.borrower);

    loan.status = Status.DEFAULTED;
    // Emit seize event
    emit LoanDefault(_loanID, msg.sender);
  }

   /**
      read functions for frontend
   */
  function getLoan(uint _loanID) external isValidLoanID(_loanID) view returns(Loan memory){
    return allLoans[_loanID];
  }

  function getUserLoanOnBorrow() external view returns(uint[] memory) {
     return userBorrow[msg.sender];
  }

    function getUserLoanOnLend() external view returns(uint[] memory) {
     return userLend[msg.sender];
  }

  // problems
  // calculate interest based on 30-day interval  
  // front end needs to conform to this
  // gas fees for borrowing. auto detect outside of loan?
  // extend loans
  // borrower has to call repayloan, not through another contract

}
