const TToken = artifacts.require("./MyToken.sol");
const Redeem = artifacts.require("./Reward.sol");
const should = require("chai").should();
const { utils, eth } = web3;
const { MerkleTree } = require("../lib/merkleTree");
const { soliditySha3 } = require("web3-utils");
const { increaseTime } = require("./helpers");

contract("MerkleRedeem - High Volume", accounts => {
  const admin = accounts[0];

  let redeem;
  let REDEEM;

  let tbal;
  let TBAL;

  const TEST_QUANTITY = 200;
  const MAX = utils.toTwosComplement(-1);

  beforeEach(async () => {
    tbal = await TToken.new("Test Bal", "TBAL", 18);
    await tbal.mint(admin, utils.toWei("1450000"));
    TBAL = tbal.address;

    redeem = await Redeem.new(TBAL);
    REDEEM = redeem.address;

    await tbal.approve(REDEEM, MAX);
  });

  it("stores " + TEST_QUANTITY + " allocations", async () => {
    const lastBlock = await web3.eth.getBlock("latest");

    let addresses = [...Array(TEST_QUANTITY).keys()].map(
      num => eth.accounts.create().address
    );

    const elements = addresses.map((address, num) =>
      soliditySha3(address, utils.toWei((num * 10).toString()))
    );
    const merkleTree = new MerkleTree(elements);
    const root = merkleTree.getHexRoot();

    await redeem.seedAllocations(1, root, utils.toWei("145000"));

    const proof36 = merkleTree.getHexProof(elements[36]);
    let result = await redeem.verifyClaim(
      addresses[36],
      1,
      utils.toWei("360"),
      proof36
    );
    assert(result, "account 36 should have an allocation");

    const proof48 = merkleTree.getHexProof(elements[48]);
    result = await redeem.verifyClaim(
      addresses[48],
      1,
      utils.toWei("480"),
      proof48
    );
    assert(result, "account 48 should have an allocation");
  });

  describe("When a user has several allocation to claim", () => {
    const claimBalance1 = utils.toWei("1111");
    const elements1 = [utils.soliditySha3(accounts[1], claimBalance1)];
    const merkleTree1 = new MerkleTree(elements1);
    const root1 = merkleTree1.getHexRoot();

    const claimBalance2 = utils.toWei("1222");
    const elements2 = [utils.soliditySha3(accounts[1], claimBalance2)];
    const merkleTree2 = new MerkleTree(elements2);
    const root2 = merkleTree2.getHexRoot();

    const claimBalance3 = utils.toWei("1333");
    const elements3 = [utils.soliditySha3(accounts[1], claimBalance3)];
    const merkleTree3 = new MerkleTree(elements3);
    const root3 = merkleTree3.getHexRoot();

    const claimBalance4 = utils.toWei("1444");
    const elements4 = [utils.soliditySha3(accounts[1], claimBalance4)];
    const merkleTree4 = new MerkleTree(elements4);
    const root4 = merkleTree4.getHexRoot();

    const claimBalance5 = utils.toWei("1555");
    const elements5 = [utils.soliditySha3(accounts[1], claimBalance5)];
    const merkleTree5 = new MerkleTree(elements5);
    const root5 = merkleTree5.getHexRoot();

    const claimBalance6 = utils.toWei("1555");
    const elements6 = [utils.soliditySha3(accounts[1], claimBalance5)];
    const merkleTree6 = new MerkleTree(elements5);
    const root6 = merkleTree5.getHexRoot();

    beforeEach(async () => {
      let lastBlock = await web3.eth.getBlock("latest");

      await redeem.seedAllocations(1, root1, utils.toWei("145000"));

      await increaseTime(7);
      lastBlock = await web3.eth.getBlock("latest");
      let lastBlockHash =
        "0xb6801f31f93d990dfe65d67d3479c3853d5fafd7a7f2b8fad9e68084d8d409e0"; // set this manually to simplify testing
      await redeem.seedAllocations(2, root2, utils.toWei("145000"));

      await increaseTime(7);
      lastBlock = await web3.eth.getBlock("latest");
      await redeem.seedAllocations(3, root3, utils.toWei("145000"));

      await increaseTime(7);
      lastBlock = await web3.eth.getBlock("latest");
      await redeem.seedAllocations(4, root4, utils.toWei("145000"));

      await increaseTime(7);
      lastBlock = await web3.eth.getBlock("latest");
      await redeem.seedAllocations(5, root5, utils.toWei("145000"));
    });

    it("Allows the user to claim multiple weeks at once", async () => {
      await increaseTime(8);

      const proof1 = merkleTree1.getHexProof(elements1[0]);
      const proof2 = merkleTree2.getHexProof(elements2[0]);
      const proof3 = merkleTree3.getHexProof(elements3[0]);
      const proof4 = merkleTree4.getHexProof(elements4[0]);
      const proof5 = merkleTree5.getHexProof(elements5[0]);

      await redeem.claimWeeks(
        accounts[1],
        [
          [1, claimBalance1, proof1],
          [2, claimBalance2, proof2],
          [3, claimBalance3, proof3],
          [4, claimBalance4, proof4],
          [5, claimBalance5, proof5]
        ],
        { from: accounts[1] }
      );

      let result = await tbal.balanceOf(accounts[1]);
      assert(
        result == utils.toWei("6665"),
        "user should receive all tokens, including current week"
      );
    });
  });
});