// contracts/PrimaBlueToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/WhitelistCrowdsale.sol";


contract PrimaBlueCrowdsale is Crowdsale, TimedCrowdsale, WhitelistCrowdsale, Ownable {
    using SafeERC20 for ERC20;

    uint256 private constant PURCHASE_MINIMUM_AMOUNT_WEI = 5 * 10 ** 16;  // 0.05 ETH

    constructor(
        uint256 defaultRate,  
        address owner,  
        address payable wallet, //this is where the USDC ends up that will become the liquidity pool
        IERC20 token,
        uint256 openingTime,
        uint256 closingTime
    )
    public
    Crowdsale(defaultRate, wallet, token)
    TimedCrowdsale(openingTime, closingTime)
    {
        transferOwnership(owner);
        if (!isWhitelistAdmin(owner)) {
            addWhitelistAdmin(owner);
        }
    }

    function addWhitelistedAccounts(address[] memory accounts) public onlyWhitelistAdmin {
        for (uint i = 0; i < accounts.length; i++) {
            _addWhitelisted(accounts[i]);
        }
    }

    function burn() public {
        require(hasClosed());
        ERC20Burnable burnableToken = ERC20Burnable(address(token()));
        burnableToken.burn(burnableToken.balanceOf(address(this)));
    }

    /**
        * @dev Transfer tokens originally intended to be sold as part of this crowdsale to an IEO.
        * @param to Token beneficiary
        * @param value Amount of wei to transfer
        */
    function transferToIEO(address to, uint256 value) onlyOwner public {
        require(!hasClosed());
        token().safeTransfer(to, value);
    }

    /**
        * @dev Extend parent behavior requiring a minimum contribution of 0.5 ETH.
        * @param _beneficiary Token beneficiary
        * @param _weiAmount Amount of wei contributed
        */
    function _preValidatePurchase(address _beneficiary, uint256 _weiAmount) internal view {
        require(_weiAmount >= PURCHASE_MINIMUM_AMOUNT_WEI);
        super._preValidatePurchase(_beneficiary, _weiAmount);
    }    


}