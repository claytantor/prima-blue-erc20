// contracts/PrimaBlueToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Capped.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract PrimaBlueToken is ERC20, ERC20Detailed, ERC20Mintable, ERC20Burnable, ERC20Capped, Ownable {

  using SafeMath for uint256;

  address private _burnWallet;

  uint256 private constant BURN_DIV = 200; // 0.5 percent burned

  constructor(address owner, address burnWallet)
  ERC20Burnable()
  ERC20Mintable()
  ERC20Detailed("Prima Blue", "PRMB", 18)
  ERC20Capped(100*10**24) // 100 million ASR
  ERC20()
  public
  {
    _burnWallet = burnWallet;
    transferOwnership(owner);
  }

  /**
    * @dev Transfer token for a specified address
    * @param to The address to transfer to.
    * @param value The amount to be transferred.
    */
  function transfer(address to, uint256 value) public onlyOwner returns (bool) {
    require(to != address(this));

    /* .005 per transacton will go to the burn = div/200 */
    /* div(uint256 a, uint256 b, string errorMessage) → uint256*/
    uint256 v_burn = value.div(BURN_DIV);
    uint256 v_send = value.sub(v_burn);

    require(
          value == v_burn.add(v_send),
          "VALUE BURN MATCH"
    );

    // send to the burn wallet
    _transfer(msg.sender, _burnWallet, v_burn);

    // send to the receiver
    _transfer(msg.sender, to, v_send);

    return true;
  }

  /**
   * @dev Function to mint tokens
   * @param to The address that will receive the minted tokens.
   * @param value The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address to, uint256 value) public onlyMinter returns (bool) {
    require(to != address(this));
    _mint(to, value);
    return true;
  }

  /**
   * @dev ERC223 alternative emergency Token Extraction
   */
  function emergencyTokenExtraction(address erc20tokenAddr) onlyOwner public {
    IERC20 erc20token = IERC20(erc20tokenAddr);
    uint256 balance = erc20token.balanceOf(address(this));
    if (balance == 0) {
      revert();
    }
    erc20token.transfer(msg.sender, balance);
  }


  function burnWallet() public view returns (address) {
    return _burnWallet;
  }


}
