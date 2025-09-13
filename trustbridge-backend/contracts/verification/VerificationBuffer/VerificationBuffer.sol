// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title Verification Buffer - Implements oracle lag protection
 */
contract VerificationBuffer is AccessControl {
    struct BufferedAsset {
        bytes32 assetId;
        uint256 submissionTime;
        uint256 initialValuation;
        uint256 bufferPeriod;
        uint8 liquidationProtectionLevel; // 0-100%
        bool isActive;
    }
    
    mapping(bytes32 => BufferedAsset) public bufferedAssets;
    mapping(bytes32 => uint256[]) public priceHistory;
    
    uint256 public constant DEFAULT_BUFFER_PERIOD = 72 hours;
    uint256 public constant PRICE_SAMPLE_INTERVAL = 4 hours;
    
    event BufferActivated(bytes32 indexed assetId, uint8 protectionLevel);
    event BufferExpired(bytes32 indexed assetId, bool priceStabilized);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    function activateBuffer(bytes32 assetId, uint256 initialValuation) external onlyRole(DEFAULT_ADMIN_ROLE) {
        bufferedAssets[assetId] = BufferedAsset({
            assetId: assetId,
            submissionTime: block.timestamp,
            initialValuation: initialValuation,
            bufferPeriod: DEFAULT_BUFFER_PERIOD,
            liquidationProtectionLevel: 90, // Start with 90% protection
            isActive: true
        });
        
        emit BufferActivated(assetId, 90);
    }
    
    function getProtectionLevel(bytes32 assetId) external view returns (uint8) {
        BufferedAsset memory buffered = bufferedAssets[assetId];
        if (!buffered.isActive) return 0;
        
        uint256 timeElapsed = block.timestamp - buffered.submissionTime;
        
        if (timeElapsed < 24 hours) return 90;
        if (timeElapsed < 48 hours) return 70;
        if (timeElapsed < 72 hours) return 50;
        
        return 0; // Full liquidation risk after 72 hours
    }
    
    function updatePriceHistory(bytes32 assetId, uint256 price) external onlyRole(DEFAULT_ADMIN_ROLE) {
        priceHistory[assetId].push(price);
        
        // Keep only last 24 samples (4 days of 4-hour intervals)
        if (priceHistory[assetId].length > 24) {
            for (uint i = 0; i < priceHistory[assetId].length - 1; i++) {
                priceHistory[assetId][i] = priceHistory[assetId][i + 1];
            }
            priceHistory[assetId].pop();
        }
    }
}
