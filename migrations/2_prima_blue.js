// const ERC20 = artifacts.require("ERC20");
// const ERC20Burnable = artifacts.require("ERC20Burnable");
// const TokenVesting = artifacts.require("TokenVesting");
// const PrimaBlueToken = artifacts.require("PrimaBlueToken");
const PrimaBlueCrowdsaleDeployer = artifacts.require("PrimaBlueCrowdsaleDeployer");
// const PrimaBlueCrowdsale = artifacts.require("PrimaBlueCrowdsale");

let OWNER_ADDR = PrimaBlueCrowdsaleDeployer.address

module.exports = async function (deployer) {
  
  await deployer.deploy(PrimaBlueCrowdsaleDeployer,OWNER_ADDR);
  // await deployer.deploy(PrimaBlueCrowdsale,OWNER_ADDR);
  // await deployer.deploy(PrimaBlueToken,OWNER_ADDR);

};
