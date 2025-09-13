// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title Settlement Engine - Handles escrow and automated settlements
 */
contract SettlementEngine is AccessControl, ReentrancyGuard, Pausable {
    enum SettlementStatus { PENDING, IN_TRANSIT, DELIVERED, SETTLED, DISPUTED }
    
    struct Settlement {
        bytes32 id;
        bytes32 assetId;
        address buyer;
        address seller;
        uint256 amount;
        uint256 escrowBalance;
        SettlementStatus status;
        uint256 createdAt;
        uint256 deliveryDeadline;
        string trackingHash;
    }
    
    struct DeliveryConfirmation {
        address confirmer;
        uint256 timestamp;
        string proofHash;
        bool isValid;
    }
    
    mapping(bytes32 => Settlement) public settlements;
    mapping(bytes32 => DeliveryConfirmation[]) public deliveryConfirmations;
    mapping(bytes32 => uint256) public confirmationCount;
    
    uint256 public constant CONFIRMATION_THRESHOLD = 2;
    uint256 public settlementFee = 100; // 1% in basis points
    address public feeRecipient;
    
    event SettlementCreated(bytes32 indexed settlementId, bytes32 assetId, address buyer, address seller);
    event DeliveryConfirmed(bytes32 indexed settlementId, address confirmer);
    event SettlementCompleted(bytes32 indexed settlementId, uint256 amount);
    event DisputeRaised(bytes32 indexed settlementId, address disputer);
    
    constructor(address _feeRecipient) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        feeRecipient = _feeRecipient;
    }
    
    function createSettlement(
        bytes32 assetId,
        address seller,
        uint256 deliveryDeadline,
        string memory trackingHash
    ) external payable nonReentrant whenNotPaused returns (bytes32) {
        require(msg.value > 0, "No payment provided");
        require(seller != address(0), "Invalid seller");
        require(deliveryDeadline > block.timestamp, "Invalid deadline");
        
        bytes32 settlementId = keccak256(
            abi.encodePacked(msg.sender, seller, assetId, block.timestamp)
        );
        
        settlements[settlementId] = Settlement({
            id: settlementId,
            assetId: assetId,
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            escrowBalance: msg.value,
            status: SettlementStatus.PENDING,
            createdAt: block.timestamp,
            deliveryDeadline: deliveryDeadline,
            trackingHash: trackingHash
        });
        
        emit SettlementCreated(settlementId, assetId, msg.sender, seller);
        return settlementId;
    }
    
    function confirmDelivery(
        bytes32 settlementId,
        string memory proofHash
    ) external {
        Settlement storage settlement = settlements[settlementId];
        require(settlement.status == SettlementStatus.IN_TRANSIT, "Not in transit");
        
        // Add delivery confirmation
        deliveryConfirmations[settlementId].push(DeliveryConfirmation({
            confirmer: msg.sender,
            timestamp: block.timestamp,
            proofHash: proofHash,
            isValid: true
        }));
        
        confirmationCount[settlementId]++;
        
        emit DeliveryConfirmed(settlementId, msg.sender);
        
        // Auto-settle if threshold reached
        if (confirmationCount[settlementId] >= CONFIRMATION_THRESHOLD) {
            _executeSettlement(settlementId);
        }
    }
    
    function _executeSettlement(bytes32 settlementId) internal {
        Settlement storage settlement = settlements[settlementId];
        require(settlement.status != SettlementStatus.SETTLED, "Already settled");
        
        uint256 fee = (settlement.amount * settlementFee) / 10000;
        uint256 sellerAmount = settlement.amount - fee;
        
        settlement.status = SettlementStatus.SETTLED;
        settlement.escrowBalance = 0;
        
        // Transfer funds
        payable(settlement.seller).transfer(sellerAmount);
        payable(feeRecipient).transfer(fee);
        
        emit SettlementCompleted(settlementId, sellerAmount);
    }
    
    function raiseDispute(bytes32 settlementId) external {
        Settlement storage settlement = settlements[settlementId];
        require(
            msg.sender == settlement.buyer || msg.sender == settlement.seller,
            "Not participant"
        );
        
        settlement.status = SettlementStatus.DISPUTED;
        emit DisputeRaised(settlementId, msg.sender);
    }
}
