// SPDX-License-Identifier: MIT

/**
 * @summary: Compound Integration
 * @author: Himanshu Goyal
 */

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyTokenStorage {
     uint8 internal decimalNo;
}

contract MyToken is ERC20, Ownable, MyTokenStorage {
 
  modifier amountCheck(uint _amount) {
     require(_amount > 0, "Token value is zero");
    _;
  }

 constructor(string memory _name, string memory _symbol, uint8  _decimals) public  ERC20(_name, _symbol) {
     decimalNo = _decimals;
  }
  
  function decimals() public view virtual override returns (uint8) {
        return decimalNo;
  }
  
  function mint(address _recipient, uint256 _amount) external amountCheck(_amount) onlyOwner {
     _mint(_recipient, _amount);
  }
  
  function burn(address _recipient, uint _amount) external amountCheck(_amount) onlyOwner  {
     _burn(_recipient, _amount);
  }
  
}