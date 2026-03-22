// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CharityFund {

    // fundraising goal
    uint public targetAmount;

    // total collected donations
    uint public totalDonations;

    // mapping to track each donor's contributions
    mapping(address => uint) public donations;

    // constructor to set target amount
    constructor(uint _targetAmount) {
        targetAmount = _targetAmount;
    }

    // function to donate Ether
    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than 0");

        // update donor contribution
        donations[msg.sender] += msg.value;

        // update total donations
        totalDonations += msg.value;
    }

    // check how much a specific address donated
    function getDonation(address donor) public view returns (uint) {
        return donations[donor];
    }

    // check remaining amount to reach the goal
    function remainingAmount() public view returns (uint) {
        if (totalDonations >= targetAmount) {
            return 0;
        }
        return targetAmount - totalDonations;
    }
}