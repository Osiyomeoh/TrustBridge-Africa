// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Asset Token - Individual RWA token contract
 */
contract AssetToken is ERC20, AccessControl {
    bytes32 public assetId;
    address public assetFactory;
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        bytes32 _assetId
    ) ERC20(name, symbol) {
        assetId = _assetId;
        assetFactory = msg.sender;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _mint(msg.sender, totalSupply);
    }
    
    function burn(uint256 amount) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Only factory can burn");
        _burn(msg.sender, amount);
    }
}
