// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IVerificationRegistry.sol";
import "./interfaces/IAttestorManager.sol";
import "./interfaces/IPolicyManager.sol";

/**
 * @title Verification Registry
 * @notice Manages on-chain verification records for assets
 */
contract VerificationRegistry is IVerificationRegistry, AccessControl, ReentrancyGuard {
    bytes32 public constant GATEWAY_ROLE = keccak256("GATEWAY_ROLE");



    mapping(bytes32 => VerificationRecord) public verifications;
    mapping(bytes32 => mapping(address => bool)) public attestorSigned;
    
    IAttestorManager public attestorManager;
    IPolicyManager public policyManager;

    // Events
    event VerificationSubmitted(bytes32 indexed assetId, bytes32 assetType, uint256 score, bytes32 evidenceRoot);
    event VerificationApproved(bytes32 indexed assetId, uint256 score);
    event VerificationRevoked(bytes32 indexed assetId, string reason);

    constructor(address _attestorManager, address _policyManager) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GATEWAY_ROLE, msg.sender);
        
        attestorManager = IAttestorManager(_attestorManager);
        policyManager = IPolicyManager(_policyManager);
    }

    function setAttestorManager(address _attestorManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        attestorManager = IAttestorManager(_attestorManager);
    }

    function setPolicyManager(address _policyManager) external onlyRole(DEFAULT_ADMIN_ROLE) {
        policyManager = IPolicyManager(_policyManager);
    }

    function submitVerification(
        bytes32 assetId,
        bytes32 assetType,
        address owner,
        uint256 score,
        bytes32 evidenceRoot,
        uint256 expiresAt,
        bytes[] calldata attestorSigs,
        address[] calldata signingAttestors
    ) external onlyRole(GATEWAY_ROLE) nonReentrant {
        require(verifications[assetId].assetId == 0, "Verification already exists");
        require(attestorSigs.length == signingAttestors.length, "Signature count mismatch");
        
        IPolicyManager.AssetTypePolicy memory policy = policyManager.getAssetTypePolicy(assetType);
        require(policy.minScore > 0, "Asset type not supported");
        require(attestorSigs.length >= policy.requiredAttestors, "Insufficient attestor signatures");

        // Verify attestor signatures
        for (uint i = 0; i < signingAttestors.length; i++) {
            require(attestorManager.isAttestorActive(signingAttestors[i]), "Inactive attestor");
            
            // In production, would verify the actual signature here
            // bytes32 messageHash = keccak256(abi.encodePacked(assetId, score, evidenceRoot));
            // require(verifySignature(messageHash, attestorSigs[i], signingAttestors[i]), "Invalid signature");
        }

        // Create verification record
        VerificationRecord storage record = verifications[assetId];
        record.assetId = assetId;
        record.assetType = assetType;
        record.owner = owner;
        record.score = score;
        record.evidenceRoot = evidenceRoot;
        record.createdAt = block.timestamp;
        record.expiresAt = expiresAt;
        record.attestors = signingAttestors;

        // Mark attestor signatures
        for (uint i = 0; i < signingAttestors.length; i++) {
            attestorSigned[assetId][signingAttestors[i]] = true;
            attestorManager.incrementAttestationCount(signingAttestors[i]);
        }

        // Determine status
        if (score >= policy.minScore) {
            if (policy.requiresManualReview && score < 8500) { // 85%
                record.status = VerificationStatus.PENDING;
            } else {
                record.status = VerificationStatus.VERIFIED;
                emit VerificationApproved(assetId, score);
            }
        } else {
            record.status = VerificationStatus.REJECTED;
        }

        emit VerificationSubmitted(assetId, assetType, score, evidenceRoot);
    }

    function reviewVerification(
        bytes32 assetId,
        bool approved
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        VerificationRecord storage record = verifications[assetId];
        require(record.assetId != 0, "Verification not found");
        require(record.status == VerificationStatus.PENDING, "Not pending review");

        if (approved) {
            record.status = VerificationStatus.VERIFIED;
            emit VerificationApproved(assetId, record.score);
        } else {
            record.status = VerificationStatus.REJECTED;
        }
    }

    function revokeVerification(
        bytes32 assetId,
        string memory reason
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        VerificationRecord storage record = verifications[assetId];
        require(record.assetId != 0, "Verification not found");
        require(record.status == VerificationStatus.VERIFIED, "Not verified");

        record.status = VerificationStatus.REVOKED;

        // Slash attestors who signed this verification
        for (uint i = 0; i < record.attestors.length; i++) {
            attestorManager.slashAttestor(record.attestors[i], "Fraudulent verification");
        }

        emit VerificationRevoked(assetId, reason);
    }

    function getVerificationStatus(bytes32 assetId) 
        external 
        view 
        returns (
            bool verified,
            uint256 score,
            uint256 expiresAt,
            VerificationStatus status
        ) 
    {
        VerificationRecord storage record = verifications[assetId];
        
        if (record.assetId == 0) {
            return (false, 0, 0, VerificationStatus.PENDING);
        }

        // Check if verification has expired
        if (block.timestamp > record.expiresAt && record.status == VerificationStatus.VERIFIED) {
            return (false, record.score, record.expiresAt, VerificationStatus.EXPIRED);
        }

        return (
            record.status == VerificationStatus.VERIFIED,
            record.score,
            record.expiresAt,
            record.status
        );
    }

    function hasAttestorSigned(bytes32 assetId, address attestor) 
        external 
        view 
        returns (bool) 
    {
        return attestorSigned[assetId][attestor];
    }
}
