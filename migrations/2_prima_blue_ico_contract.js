
const PrimaBlueCrowdsaleDeployer = artifacts.require("PrimaBlueCrowdsaleDeployer");

let BURN_ADDR = '0x7bABa28406fc01C78462f618cc51cbA8AA12D644'

module.exports = async function (deployer) {
  await deployer.deploy(PrimaBlueCrowdsaleDeployer, PrimaBlueCrowdsaleDeployer.address, BURN_ADDR);
};
