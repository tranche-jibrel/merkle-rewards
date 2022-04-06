require('dotenv').config();
var RewardContract = artifacts.require("Reward");

module.exports = async (deployer, network, accounts) => {
  const owner = accounts[0];
  if(network == 'kovan') {
    console.log(network, owner)
    let { REWARD_TOKEN } = process.env;
    await deployer.deploy(RewardContract, REWARD_TOKEN);
    const contractObj = await RewardContract.deployed();
    console.log('REWARD_CONTRACT_ADDRESS=',contractObj.address)
  }
}