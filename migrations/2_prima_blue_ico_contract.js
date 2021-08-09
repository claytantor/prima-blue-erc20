
const PrimaBlueCrowdsaleDeployer = artifacts.require("PrimaBlueCrowdsaleDeployer");

let OWNER_ADDR = PrimaBlueCrowdsaleDeployer.address
let BURN_ADDR = '0x361eA92609B0Af541704b887E14b99CB536724D7'

module.exports = async function (deployer) {
  await deployer.deploy(PrimaBlueCrowdsaleDeployer, OWNER_ADDR, BURN_ADDR);
};
