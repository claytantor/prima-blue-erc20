const TokenVesting = artifacts.require("TokenVesting");
const moment = require('moment');
const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const {expect} = require('chai');
const Web3 = require('web3');

let NUMBER_YEARS_VESTING = 1

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("TokenVesting", accounts => {
  // console.log(accounts);
  const owner = accounts[1];
  const team1Addr = accounts[2];

  let team1addr, team1Vesting;

  const deployVestingContracts = async durationInYears => {
    const start = moment().unix();
    const duration = moment.duration().add(durationInYears, 'years').asSeconds();

    team1Vesting = await TokenVesting.new(team1Addr, start, 0, duration, false);
    team1addr = team1Vesting.address; 
  };

  beforeEach(async () => {
    await deployVestingContracts(NUMBER_YEARS_VESTING);
  });

  it("should assert true as deployed", async function () {
    start = await team1Vesting.start();
    return assert.isTrue(true);
  });

});