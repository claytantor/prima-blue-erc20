const PrimaBlueToken = artifacts.require("PrimaBlueToken");
const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const {expect} = require('chai');
const Web3 = require('web3');

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("PrimaBlueToken", accounts => {
  // console.log(accounts);
  const owner = accounts[1];

  it("should assert true", async function () {
    await PrimaBlueToken.deployed();
    return assert.isTrue(true);
  });

});