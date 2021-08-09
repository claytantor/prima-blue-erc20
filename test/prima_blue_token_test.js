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
  const owner = accounts[1];
  const mintAddr = accounts[2];
  const txferAddr = accounts[3];
  const burnWallet = accounts[4];
  
  let tokenNew;

  beforeEach(async () => {
    tokenNew = await PrimaBlueToken.new(owner, burnWallet);
  });

  it("should be mintable", async function () {
    //mint this 
    let mtx = await tokenNew.mint(mintAddr, 100);
    return assert.isTrue(mtx.receipt.status);
  });

  it("should be transferable", async function () {
    //mint this 
    await tokenNew.mint(owner, 2000);
    let transfer = await tokenNew.transfer(txferAddr, 1000, {from:owner});
    return assert.isTrue(transfer.receipt.status);
  });

  it("verify all wallet balances", async function () {
    //mint this 
    await tokenNew.mint(owner, 2000);
    await tokenNew.transfer(txferAddr, 1000, {from:owner});

    expect(await tokenNew.balanceOf.call(owner)).to.be.bignumber.equal(new BN(1000));
    expect(await tokenNew.balanceOf.call(txferAddr)).to.be.bignumber.equal(new BN(995));
    expect(await tokenNew.balanceOf.call(burnWallet)).to.be.bignumber.equal(new BN(5));

  });

});