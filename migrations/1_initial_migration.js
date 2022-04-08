require('dotenv').config();
const MyToken = artifacts.require("MyToken");
const RewardContract = artifacts.require("Reward");

module.exports = async (deployer, network, accounts) => {
  const owner = accounts[0];

  if(network == 'development') {
    console.log(network, owner);

    await deployer.deploy(MyToken, "Pippo", "PPP", 18);
    const myTokenInst = await MyToken.deployed()
    console.log('MYTOKEN_ADDRESS =',myTokenInst.address)
    await deployer.deploy(RewardContract, myTokenInst.address);

    const contractObj = await RewardContract.deployed();
    console.log('REWARD_CONTRACT_ADDRESS =',contractObj.address)

  } else if(network == 'kovan') {
    console.log(network, owner);
    let { REWARD_TOKEN } = process.env;
    await deployer.deploy(RewardContract, REWARD_TOKEN);
    const contractObj = await RewardContract.deployed();
    console.log('REWARD_CONTRACT_ADDRESS =',contractObj.address)
  }
}