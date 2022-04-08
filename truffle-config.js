const HDWalletProvider = require('@truffle/hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1', // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: '*' // Any network (default: none)
    },
    kovan: {
      networkCheckTimeout: 1000000,
      provider: () =>
        new HDWalletProvider(
          process.env.mnemonic,
          `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`
        ),
      network_id: 42,
      gas: 5500000,
      // confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  plugins: ["truffle-contract-size",
    'solidity-coverage'],
  mocha: {
    timeout: 100000
  },
  // Configure your compilers
  compilers: {
    solc: {
      version: '0.8.12', // Fetch exact version from solc-bin (default: truffle's version)
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
