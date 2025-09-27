// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./TrustToken.sol";
import "./FeeDistribution.sol";

/**
 * @title SPV Manager - Special Purpose Vehicle for institutional investors
 * @notice Manages SPV structures for large institutional investments and compliance
 */
contract SPVManager is AccessControl, ReentrancyGuard {
    bytes32 public constant SPV_ADMIN_ROLE = keccak256("SPV_ADMIN_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    
    TrustToken public trustToken;
    FeeDistribution public feeDistribution;
    
    struct SPV {
        bytes32 spvId;
        string name;
        address manager;
        address[] investors;
        uint256 totalCapital;
        uint256 minimumInvestment;
        uint256 maximumInvestors;
        uint256 managementFee;
        uint256 performanceFee;
        uint8 status; // 0: Created, 1: Active, 2: Closed, 3: Liquidated
        uint256 createdAt;
        uint256 closedAt;
        string jurisdiction;
        string complianceStatus;
    }
    
    struct Investment {
        bytes32 investmentId;
        bytes32 spvId;
        address investor;
        uint256 amount;
        uint256 timestamp;
        uint8 status; // 0: Pending, 1: Approved, 2: Rejected
    }
    
    mapping(bytes32 => SPV) public spvs;
    mapping(bytes32 => Investment) public investments;
    mapping(address => bytes32[]) public investorSPVs;
    mapping(address => bytes32[]) public managerSPVs;
    
    uint256 public totalSPVs;
    uint256 public totalInvestments;
    uint256 public constant MINIMUM_SPV_CAPITAL = 1000000 * 10**18; // 1M TRUST tokens
    uint256 public constant MAXIMUM_INVESTORS_PER_SPV = 100;
    
    event SPVCreated(bytes32 indexed spvId, address indexed manager, string name);
    event InvestmentProposed(bytes32 indexed investmentId, bytes32 indexed spvId, address indexed investor, uint256 amount);
    event InvestmentApproved(bytes32 indexed investmentId, bytes32 indexed spvId);
    event InvestmentRejected(bytes32 indexed investmentId, bytes32 indexed spvId, string reason);
    event SPVStatusUpdated(bytes32 indexed spvId, uint8 oldStatus, uint8 newStatus);
    event ComplianceUpdated(bytes32 indexed spvId, string newStatus);
    
    constructor(address _trustToken, address payable _feeDistribution) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SPV_ADMIN_ROLE, msg.sender);
        _grantRole(COMPLIANCE_ROLE, msg.sender);
        
        trustToken = TrustToken(_trustToken);
        feeDistribution = FeeDistribution(_feeDistribution);
    }
    
    function createSPV(
        string memory name,
        uint256 totalCapital,
        uint256 minimumInvestment,
        uint256 maximumInvestors,
        uint256 managementFee,
        uint256 performanceFee,
        string memory jurisdiction
    ) external onlyRole(SPV_ADMIN_ROLE) returns (bytes32) {
        require(totalCapital >= MINIMUM_SPV_CAPITAL, "Insufficient capital");
        require(maximumInvestors <= MAXIMUM_INVESTORS_PER_SPV, "Too many investors");
        require(managementFee <= 500, "Management fee too high"); // Max 5%
        require(performanceFee <= 2000, "Performance fee too high"); // Max 20%
        
        bytes32 spvId = keccak256(abi.encodePacked(name, msg.sender, block.timestamp));
        
        spvs[spvId] = SPV({
            spvId: spvId,
            name: name,
            manager: msg.sender,
            investors: new address[](0),
            totalCapital: totalCapital,
            minimumInvestment: minimumInvestment,
            maximumInvestors: maximumInvestors,
            managementFee: managementFee,
            performanceFee: performanceFee,
            status: 0, // Created
            createdAt: block.timestamp,
            closedAt: 0,
            jurisdiction: jurisdiction,
            complianceStatus: "Pending"
        });
        
        managerSPVs[msg.sender].push(spvId);
        totalSPVs++;
        
        emit SPVCreated(spvId, msg.sender, name);
        
        return spvId;
    }
    
    function proposeInvestment(bytes32 spvId, uint256 amount) external nonReentrant returns (bytes32) {
        SPV storage spv = spvs[spvId];
        require(spv.status == 1, "SPV not active");
        require(amount >= spv.minimumInvestment, "Below minimum investment");
        require(spv.investors.length < spv.maximumInvestors, "SPV full");
        require(trustToken.balanceOf(msg.sender) >= amount, "Insufficient balance");
        
        bytes32 investmentId = keccak256(abi.encodePacked(spvId, msg.sender, block.timestamp));
        
        investments[investmentId] = Investment({
            investmentId: investmentId,
            spvId: spvId,
            investor: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            status: 0 // Pending
        });
        
        totalInvestments++;
        
        emit InvestmentProposed(investmentId, spvId, msg.sender, amount);
        
        return investmentId;
    }
    
    function approveInvestment(bytes32 investmentId) external onlyRole(SPV_ADMIN_ROLE) {
        Investment storage investment = investments[investmentId];
        SPV storage spv = spvs[investment.spvId];
        
        require(investment.status == 0, "Investment not pending");
        require(spv.status == 1, "SPV not active");
        require(spv.investors.length < spv.maximumInvestors, "SPV full");
        
        // Transfer tokens from investor to SPV
        trustToken.transferFrom(investment.investor, address(this), investment.amount);
        
        // Add investor to SPV
        spv.investors.push(investment.investor);
        investorSPVs[investment.investor].push(investment.spvId);
        
        investment.status = 1; // Approved
        
        emit InvestmentApproved(investmentId, investment.spvId);
    }
    
    function rejectInvestment(bytes32 investmentId, string memory reason) external onlyRole(SPV_ADMIN_ROLE) {
        Investment storage investment = investments[investmentId];
        require(investment.status == 0, "Investment not pending");
        
        investment.status = 2; // Rejected
        
        emit InvestmentRejected(investmentId, investment.spvId, reason);
    }
    
    function updateSPVStatus(bytes32 spvId, uint8 newStatus) external onlyRole(SPV_ADMIN_ROLE) {
        SPV storage spv = spvs[spvId];
        require(spv.spvId != 0, "SPV does not exist");
        
        uint8 oldStatus = spv.status;
        spv.status = newStatus;
        
        if (newStatus == 2) { // Closed
            spv.closedAt = block.timestamp;
        }
        
        emit SPVStatusUpdated(spvId, oldStatus, newStatus);
    }
    
    function updateComplianceStatus(bytes32 spvId, string memory newStatus) external onlyRole(COMPLIANCE_ROLE) {
        SPV storage spv = spvs[spvId];
        require(spv.spvId != 0, "SPV does not exist");
        
        spv.complianceStatus = newStatus;
        
        emit ComplianceUpdated(spvId, newStatus);
    }
    
    function getSPV(bytes32 spvId) external view returns (SPV memory) {
        return spvs[spvId];
    }
    
    function getSPVInvestors(bytes32 spvId) external view returns (address[] memory) {
        return spvs[spvId].investors;
    }
    
    function getInvestorSPVs(address investor) external view returns (bytes32[] memory) {
        return investorSPVs[investor];
    }
    
    function getManagerSPVs(address manager) external view returns (bytes32[] memory) {
        return managerSPVs[manager];
    }
}
