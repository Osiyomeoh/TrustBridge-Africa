// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IAttestorManager.sol";

/**
 * @title Attestor Manager
 * @notice Manages attestor registration, staking, and reputation
 */
contract AttestorManager is IAttestorManager, AccessControl, ReentrancyGuard {
    bytes32 public constant ATTESTOR_ROLE = keccak256("ATTESTOR_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");

    mapping(address => AttestorInfo) public attestors;
    uint256 public totalStakedAmount;
    uint256 public slashedAmount;

    event AttestorRegistered(address indexed attestor, string organizationType, uint256 stakeAmount);
    event AttestorSlashed(address indexed attestor, uint256 amount, string reason);
    event AttestorReputationUpdated(address indexed attestor, uint256 newScore);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
    }

    function registerAttestor(
        address attestor,
        string memory organizationType,
        string memory country,
        uint256 initialStake
    ) external payable onlyRole(MANAGER_ROLE) {
        require(msg.value >= initialStake, "Insufficient stake");
        require(!attestors[attestor].isActive, "Attestor already registered");

        attestors[attestor] = AttestorInfo({
            isActive: true,
            stakeAmount: msg.value,
            reputationScore: 5000, // Start with 50% reputation
            organizationType: organizationType,
            country: country,
            totalAttestations: 0,
            correctAttestations: 0
        });

        totalStakedAmount += msg.value;
        _grantRole(ATTESTOR_ROLE, attestor);
        emit AttestorRegistered(attestor, organizationType, msg.value);
    }

    function updateAttestorReputation(address attestor, bool wasCorrect) 
        external 
        onlyRole(MANAGER_ROLE) 
    {
        require(attestors[attestor].isActive, "Attestor not active");

        if (wasCorrect) {
            attestors[attestor].correctAttestations++;
        }

        // Recalculate reputation score
        uint256 accuracy = (attestors[attestor].correctAttestations * 10000) / 
                          attestors[attestor].totalAttestations;
        attestors[attestor].reputationScore = accuracy;

        emit AttestorReputationUpdated(attestor, accuracy);
    }

    function slashAttestor(address attestor, string memory reason) 
        external 
        onlyRole(MANAGER_ROLE) 
        nonReentrant 
    {
        AttestorInfo storage info = attestors[attestor];
        require(info.isActive, "Attestor not active");

        uint256 slashAmount = info.stakeAmount / 4; // Slash 25% of stake
        info.stakeAmount -= slashAmount;
        info.reputationScore = info.reputationScore / 2; // Halve reputation

        totalStakedAmount -= slashAmount;
        slashedAmount += slashAmount;

        // If stake falls below minimum, deactivate
        if (info.stakeAmount < 1 ether) {
            info.isActive = false;
            _revokeRole(ATTESTOR_ROLE, attestor);
        }

        emit AttestorSlashed(attestor, slashAmount, reason);
    }

    function getAttestorInfo(address attestor) external view returns (AttestorInfo memory) {
        return attestors[attestor];
    }

    function isAttestorActive(address attestor) external view returns (bool) {
        return attestors[attestor].isActive;
    }

    function incrementAttestationCount(address attestor) external onlyRole(MANAGER_ROLE) {
        attestors[attestor].totalAttestations++;
    }

    function withdrawSlashedFunds() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 amount = slashedAmount;
        slashedAmount = 0;
        payable(msg.sender).transfer(amount);
    }
}
