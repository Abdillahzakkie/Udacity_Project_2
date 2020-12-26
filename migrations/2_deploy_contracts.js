const StarNotary = artifacts.require("StarNotary");

module.exports = async (deployer) => {
  await deployer.deploy(StarNotary, "STAR 1", "SYT");
};
