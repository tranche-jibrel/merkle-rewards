// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardStorage {
    IERC20 public token;
    event Claimed(address _claimant, uint256 _balance, uint256 _week);

    // Recorded weeks
    mapping(uint256 => bytes32) public weekMerkleRoots;
    mapping(uint256 => mapping(address => bool)) public claimed;

    struct Claim {
        uint week;
        uint balance;
        bytes32[] merkleProof;
    }
}

contract Reward is RewardStorage, Ownable {
    constructor( address _token) {
        token = IERC20(_token);
    }

    function seedAllocations(uint _week,bytes32 _merkleRoot,uint _totalAllocation) external onlyOwner {
        require(weekMerkleRoots[_week] == bytes32(0), "cannot rewrite merkle root");
        weekMerkleRoots[_week] = _merkleRoot;
        require(token.transferFrom(msg.sender, address(this), _totalAllocation), "ERR_TRANSFER_FAILED");
    }

    function disburse(address _liquidityProvider,uint _balance, uint _week) private {
        if (_balance > 0) {
            emit Claimed(_liquidityProvider, _balance, _week);
            require(token.transfer(_liquidityProvider, _balance), "ERR_TRANSFER_FAILED");
        }
    }

    function verifyClaim(address _liquidityProvider,uint _week,uint _claimedBalance,bytes32[] memory _merkleProof) public view returns (bool valid) {
        bytes32 leaf = keccak256(abi.encodePacked(_liquidityProvider, _claimedBalance));
        return MerkleProof.verify(_merkleProof, weekMerkleRoots[_week], leaf);
    }

    function claimWeek(address _liquidityProvider,uint _week,uint _claimedBalance,bytes32[] memory _merkleProof) public {
        require(!claimed[_week][_liquidityProvider]);
        require(verifyClaim(_liquidityProvider, _week, _claimedBalance, _merkleProof), 'Incorrect merkle proof');

        claimed[_week][_liquidityProvider] = true;
        disburse(_liquidityProvider, _claimedBalance, _week);
    }

    function claimWeeks(address _liquidityProvider, Claim[] memory claims) public {
        Claim memory claim ;
        for(uint i = 0; i < claims.length; i++) {
            claim = claims[i];
            claimWeek(_liquidityProvider, claim.week, claim.balance, claim.merkleProof);
        }
    }

    function claimStatus(address _liquidityProvider,uint _begin,uint _end) external view returns (bool[] memory) {
        uint size = 1 + _end - _begin;
        bool[] memory arr = new bool[](size);
        for(uint i = 0; i < size; i++) {
            arr[i] = claimed[_begin + i][_liquidityProvider];
        }
        return arr;
    }
    
    function merkleRoots(uint _begin,uint _end) external view returns (bytes32[] memory) {
        uint size = 1 + _end - _begin;
        bytes32[] memory arr = new bytes32[](size);
        for(uint i = 0; i < size; i++) {
            arr[i] = weekMerkleRoots[_begin + i];
        }
        return arr;
    }
}
