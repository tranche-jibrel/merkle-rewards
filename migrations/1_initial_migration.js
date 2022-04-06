require('dotenv').config();

module.exports = async (deployer, network, accounts) => {
  const owner = accounts[0];
  console.log(network, owner)

}