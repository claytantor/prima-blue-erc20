const moment = require('moment');
const Web3 = require('web3');

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

const {expect} = require('chai');
const {initialBlocktime} = require("../utils/testHelpers");

const PrimaBlueCrowdsaleDeployer = artifacts.require("PrimaBlueCrowdsaleDeployer");
const PrimaBlueCrowdsale = artifacts.require("PrimaBlueCrowdsale");
const PrimaBlueToken = artifacts.require("PrimaBlueToken");
const TokenVesting = artifacts.require('TokenVesting');


let NUMBER_YEARS_VESTING = 1

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("PrimaBlueCrowdsaleDeployer", accounts => {

  console.log(accounts);
  const owner = accounts[1];
  const wallet = accounts[2];
  const foundation = accounts[3];
  const bounty = accounts[4];
  const familyFriends = accounts[5];
  const team1Addr = accounts[6];
  const team2Addr = accounts[7];
  const advisor1Addr = accounts[8];
  const advisor2Addr = accounts[9];

  const burnWallet = accounts[10];

  let crowdsaleDeployer, token, team1, team2, advisor1, advisor2;

  const deployVestingContracts = async durationInYears => {
    const start = moment().unix();
    const duration = moment.duration().add(durationInYears, 'years').asSeconds();

    const team1Vesting = await TokenVesting.new(team1Addr, start, 0, duration, false);
    const team2Vesting = await TokenVesting.new(team2Addr, start, 0, duration, false);
    const advisor1Vesting = await TokenVesting.new(advisor1Addr, start, 0, duration, false);
    const advisor2Vesting = await TokenVesting.new(advisor2Addr, start, 0, duration, false);

    team1 = team1Vesting.address;
    team2 = team2Vesting.address;
    advisor1 = advisor1Vesting.address;
    advisor2 = advisor2Vesting.address;
  };

  beforeEach(async () => {
    crowdsaleDeployer = await PrimaBlueCrowdsaleDeployer.new(owner,burnWallet);
    await deployVestingContracts(NUMBER_YEARS_VESTING);
  });

  describe('constructor', () => {
    it('should be owned by the correct owner', async () => {
      expect(await crowdsaleDeployer.owner.call()).to.be.equal(owner);
    });

  });

  describe('mint', () => {

    beforeEach(async () => {
      token = await PrimaBlueToken.at(await crowdsaleDeployer.token.call());
    });

    it('should only be callable by owner REVERT', async () => {
      await expectRevert(crowdsaleDeployer.mint(
        foundation,
        bounty,
        familyFriends,
        [team1],
        [800000],
        [advisor1],
        [200000],
        {from: familyFriends}
      ), 'revert');
    });

    it('should revert if team addresses and team amounts do not have the same length', async () => {
      await expectRevert(crowdsaleDeployer.mint(
        foundation,
        bounty,
        familyFriends,
        [team1, team2],
        [8000000], //not the same
        [advisor1],
        [2000000],
        {from: owner}
      ),'revert');
    });

    it('should revert if advisor addresses and advisor amounts do not have the same length', async () => {
      await expectRevert(crowdsaleDeployer.mint(
        foundation,
        bounty,
        familyFriends,
        [team1],
        [8000000],
        [advisor1, advisor2],
        [2000000], //not the same
        {from: owner}
      ),'revert');
    });

    it('should revert if vesting duration does not equal 1 years', async () => {
      await deployVestingContracts(3);

      await expectRevert(crowdsaleDeployer.mint(
        foundation,
        bounty,
        familyFriends,
        [team1],
        [8000000],
        [advisor1],
        [2000000],
        {from: owner}
      ),'revert');
    });

    it('should revert if amounts do not sum up correctly', async () => {
      await expectRevert(crowdsaleDeployer.mint(
        foundation,
        bounty,
        familyFriends,
        [team1],
        [900000000], // wrong amount - allowed are only 8000000
        [advisor1],
        [2000000],
        {from: owner}
      ),'revert');
    });

    it('should revert if amounts are not split correctly between the team and advisors', async () => {
      await expectRevert(crowdsaleDeployer.mint(
        foundation,
        bounty,
        familyFriends,
        [team1],
        [90000000], // wrong amount - allowed are only 8000000
        [advisor1],
        [10000000], // also wrong amount but together they make up the correct amount again
        {from: owner}
      ),'revert');
    });

 

    it('should only be callable by owner', async () => {

      await crowdsaleDeployer.mint(
        foundation,
        bounty,
        familyFriends,
        [team1],
        [15000000], // must add to total for all addresses
        [advisor1],
        [2000000], // must add to total for all addresses
        {from: owner}
      );

      expect(await token.balanceOf.call(team1)).to.be.bignumber.equal(Web3.utils.toWei(new BN('15000000')));
      expect(await token.balanceOf.call(advisor1)).to.be.bignumber.equal(Web3.utils.toWei(new BN('2000000')));
      return assert.isTrue(true);


    });

  });

  describe('createPreSale', () => {
    const defaultRate = 200 * (1 / 0.5); // default rate: ETH = 200 USD + 50% bonus
    const openingTime = initialBlocktime.clone().add(1, 'days');
    const closingTime = openingTime.clone().add(2, 'weeks');

    beforeEach(async () => {
      token = await PrimaBlueToken.at(await crowdsaleDeployer.token.call());
      await crowdsaleDeployer.mint(
        foundation,
        bounty,
        familyFriends,
        [team1],
        [15000000],
        [advisor1],
        [2000000],
        {from: owner}
      );
    });


    it('should instantiate presale correctly', async () => {
      await crowdsaleDeployer.createPreSale(
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix(),
        {from: owner}
      );

      const presale = await PrimaBlueCrowdsale.at(await crowdsaleDeployer.presale.call());

      expect(await presale.rate.call()).to.be.bignumber.equal(new BN(String(defaultRate)));
      expect(await presale.wallet.call()).to.eq(wallet);
      expect(await presale.openingTime.call()).to.be.bignumber.equal(new BN(String(openingTime.unix())));
      expect(await presale.closingTime.call()).to.be.bignumber.equal(new BN(String(closingTime.unix())));
      expect(await presale.owner.call()).to.eq(owner);

      return assert.isTrue(true);

    });

    it('should mint tokens for presale with specified amount', async () => {
      await crowdsaleDeployer.createPreSale(
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix(),
        {from: owner}
      );

      const presale = await PrimaBlueCrowdsale.at(await crowdsaleDeployer.presale.call());
      expect(await token.balanceOf.call(presale.address)).to.be.bignumber.equal(Web3.utils.toWei(new BN('10000000')));
    });

  });


  describe('createMainSale', () => {
    const defaultRate = 200 * (1 / 0.5); // default rate: ETH = 200 USD + 50% bonus
    const openingTime = initialBlocktime.clone().add(1, 'days');
    const closingTime = openingTime.clone().add(2, 'weeks');

    beforeEach(async () => {
      token = await PrimaBlueToken.at(await crowdsaleDeployer.token.call());
      await crowdsaleDeployer.mint(
        foundation,
        bounty,
        familyFriends,
        [team1],
        [15000000],
        [advisor1],
        [2000000],
        {from: owner}
      );
      await crowdsaleDeployer.createPreSale(
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix(),
        {from: owner}
      );
    });

    it('should only be callable by owner', async () => {
      await expectRevert(crowdsaleDeployer.createMainSale(
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix()
      ),'not the owner');
    });

    it('should instantiate mainsale correctly', async () => {
      await crowdsaleDeployer.createMainSale(
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix(),
        {from: owner}
      );

      const mainsale = await PrimaBlueCrowdsale.at(await crowdsaleDeployer.mainsale.call());
      expect(await mainsale.rate.call()).to.be.bignumber.equal(new BN(String(defaultRate)));
      expect(await mainsale.owner.call()).to.eq(owner);
      expect(await mainsale.wallet.call()).to.eq(wallet);
      expect(await mainsale.openingTime.call()).to.be.bignumber.equal(new BN(String(openingTime.unix())));
      expect(await mainsale.closingTime.call()).to.be.bignumber.equal(new BN(String(closingTime.unix())));
    });

    it('should mint tokens for mainsale with specified amount', async () => {
      await crowdsaleDeployer.createMainSale(
        defaultRate,
        owner,
        wallet,
        openingTime.unix(),
        closingTime.unix(),
        {from: owner}
      );

      const mainsale = await PrimaBlueCrowdsale.at(await crowdsaleDeployer.mainsale.call());
      expect(await token.balanceOf.call(mainsale.address)).to.be.bignumber.equal(Web3.utils.toWei(new BN('35000000')));
    });
  });


});