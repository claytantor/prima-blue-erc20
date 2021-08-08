// contracts/PrimaBlueToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "./PrimaBlueToken.sol";
import "./PrimaBlueCrowdsale.sol";
import "./TokenVesting.sol";

import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "@openzeppelin/contracts/crowdsale/emission/MintedCrowdsale.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract PrimaBlueCrowdsaleDeployer is Ownable {
    using SafeMath for uint256;

    PrimaBlueToken public token;
    PrimaBlueCrowdsale public presale;
    PrimaBlueCrowdsale public mainsale;

    uint8 private constant decimals = 18;
    uint256 private constant decimalFactor = 10**uint256(decimals);


    uint256 private constant AVAILABLE_TOTAL_SUPPLY = 100000000 * decimalFactor;

    uint256 private constant AVAILABLE_PRESALE_SUPPLY = 10000000 * decimalFactor; // 10% Released at Token Distribution (TD)
    uint256 private constant AVAILABLE_MAINSALE_SUPPLY = 35000000 * decimalFactor; // 35% Released at Token Distribution (TD)
    uint256 private constant AVAILABLE_FOUNDATION_SUPPLY = 35000000 * decimalFactor; // 35% Released at Token Distribution (TD)

    uint256 private constant AVAILABLE_BOUNTY_SUPPLY = 1000000 * decimalFactor; // 1% Released at TD
    uint256 private constant AVAILABLE_FAMILYFRIENDS_SUPPLY = 2000000 * decimalFactor; // 2% Released at TD
    uint256 private constant AVAILABLE_TEAM_SUPPLY = 15000000 * decimalFactor; // 15% Released at TD +1 years

    uint256 private constant AVAILABLE_ADVISOR_SUPPLY = 2000000 * decimalFactor; // 2% Released at TD +1 years

    uint256 private constant TOKEN_VESTING_DURATION_SECONDS = 31536000; // 1 years as seconds


    constructor(address owner, address burnWallet) public {
        transferOwnership(owner);
        token = new PrimaBlueToken(owner, burnWallet);
    }

    function mint(
        address payable foundationWallet,
        address payable bountyWallet,
        address payable familyFriendsWallet,
        address[] memory teamAddr,
        uint256[] memory teamAmounts,
        address[] memory advisorAddr,
        uint256[] memory advisorAmounts
    ) public onlyOwner returns (bool) {
        require(teamAddr.length == teamAmounts.length);
        require(advisorAddr.length == advisorAmounts.length);

        token.mint(foundationWallet, AVAILABLE_FOUNDATION_SUPPLY);
        token.mint(bountyWallet, AVAILABLE_BOUNTY_SUPPLY);
        token.mint(familyFriendsWallet, AVAILABLE_FAMILYFRIENDS_SUPPLY);
        require(
            token.totalSupply() ==
                AVAILABLE_TOTAL_SUPPLY 
                    .sub(AVAILABLE_MAINSALE_SUPPLY)
                    .sub(AVAILABLE_PRESALE_SUPPLY)
                    .sub(AVAILABLE_ADVISOR_SUPPLY)
                    .sub(AVAILABLE_TEAM_SUPPLY),
            "AVAILABLE_FAMILYFRIENDS_SUPPLY"
        );

        for (uint256 i = 0; i < teamAddr.length; i++) {
            TokenVesting vesting = TokenVesting(teamAddr[i]);
            require(vesting.duration() == TOKEN_VESTING_DURATION_SECONDS);
            token.mint(teamAddr[i], teamAmounts[i].mul(decimalFactor));
        }
        require(
            token.totalSupply() ==
                AVAILABLE_TOTAL_SUPPLY
                    .sub(AVAILABLE_MAINSALE_SUPPLY)
                    .sub(AVAILABLE_PRESALE_SUPPLY)
                    .sub(AVAILABLE_ADVISOR_SUPPLY),
            "AVAILABLE_TEAM_SUPPLY"
        );

        for (uint256 i = 0; i < advisorAddr.length; i++) {
            TokenVesting vesting = TokenVesting(advisorAddr[i]);
            require(vesting.duration() == TOKEN_VESTING_DURATION_SECONDS);
            token.mint(advisorAddr[i], advisorAmounts[i].mul(decimalFactor));
        }
        require(
            token.totalSupply() ==
                AVAILABLE_TOTAL_SUPPLY.sub(AVAILABLE_MAINSALE_SUPPLY).sub(
                    AVAILABLE_PRESALE_SUPPLY
                ),
            "AVAILABLE_ADVISOR_SUPPLY"
        );

        return true;
    }

    function createPreSale(
        uint256 defaultRate,
        address owner,
        address payable wallet,
        uint256 openingTime,
        uint256 closingTime
    ) public onlyOwner returns (bool) {
        require(address(presale) == address(0), "ALREADY_INITIALIZED");


        // uint256 defaultRate,  
        // address owner,  
        // address payable wallet,
        // IERC20 token,
        // uint256 openingTime,
        // uint256 closingTime
        presale = new PrimaBlueCrowdsale(
            defaultRate,
            owner,
            wallet,
            token,
            openingTime,
            closingTime
        );

        token.mint(address(presale), AVAILABLE_PRESALE_SUPPLY);

        return true;
    }

    function createMainSale(
        uint256 defaultRate,
        address owner,
        address payable wallet,
        uint256 openingTime,
        uint256 closingTime
    ) public onlyOwner returns (bool) {
        require(address(mainsale) == address(0), "ALREADY_INITIALIZED");

        mainsale = new PrimaBlueCrowdsale(
            defaultRate,
            owner,
            wallet,
            token,
            openingTime,
            closingTime
        );
        token.mint(address(mainsale), AVAILABLE_MAINSALE_SUPPLY);

        return true;
    }
}
