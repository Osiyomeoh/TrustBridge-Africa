// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Attestor Verification System - Complete verification system with tiers and staking
 * @notice Essential for the $1B market verification infrastructure
 */
contract AttestorVerificationSystem is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant ATTESTOR_ROLE = keccak256("ATTESTOR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    enum AttestorType {
        LEGAL_EXPERT,
        FINANCIAL_AUDITOR,
        TECHNICAL_SPECIALIST,
        REAL_ESTATE_APPRAISER,
        AGRICULTURAL_EXPERT,
        ART_APPRAISER,
        VEHICLE_INSPECTOR,
        BUSINESS_VALUATOR
    }

    enum AttestorTier {
        BASIC,      // Tier 1: 1,000 TRUST + $25
        PROFESSIONAL, // Tier 2: 5,000 TRUST + $50
        EXPERT,     // Tier 3: 10,000 TRUST + $100
        MASTER      // Tier 4: 25,000 TRUST + $250
    }

    enum VerificationStatus {
        PENDING,
        APPROVED,
        REJECTED,
        SUSPENDED
    }

    struct AttestorProfile {
        address attestorAddress;
        string name;
        string organization;
        AttestorType attestorType;
        AttestorTier tier;
        string[] specializations;
        string[] countries;
        uint256 experienceYears;
        uint256 totalVerifications;
        uint256 successfulVerifications;
        uint256 failedVerifications;
        uint256 reputationScore;
        uint256 stakedAmount;
        uint256 registrationFee;
        string[] requiredDocuments;
        string[] uploadedDocuments;
        VerificationStatus status;
        bool isActive;
        uint256 createdAt;
        uint256 lastActivity;
        string contactInfo;
        string credentials;
        string reviewerNotes;
    }

    struct VerificationRequest {
        bytes32 requestId;
        address assetOwner;
        bytes32 assetId;
        uint8 requiredType;
        string[] evidenceHashes;
        string[] documentTypes;
        uint256 requestedAt;
        uint256 deadline;
        VerificationStatus status;
        string comments;
        uint256 fee;
        address assignedAttestor;
    }

    struct TierRequirements {
        uint256 stakingRequirement;
        uint256 registrationFee;
        uint256 experienceRequirement;
        string[] requiredDocuments;
    }

    // State variables
    IERC20 public trustToken;
    address public feeRecipient;
    
    mapping(address => AttestorProfile) public attestorProfiles;
    mapping(bytes32 => VerificationRequest) public verificationRequests;
    mapping(address => bytes32[]) public userRequests;
    
    // Arrays for tracking
    address[] public attestors;
    bytes32[] public allVerificationRequestIds;
    
    // Counters
    uint256 public totalAttestors;
    uint256 public totalVerificationRequests;
    uint256 public activeVerificationRequests;
    
    // Tier requirements
    mapping(AttestorTier => TierRequirements) public tierRequirements;
    
    // Events
    event AttestorRegistered(address indexed attestor, AttestorTier tier, uint256 stakedAmount);
    event AttestorUpgraded(address indexed attestor, AttestorTier fromTier, AttestorTier toTier, uint256 additionalStake, uint256 upgradeFee);
    event AttestorStatusUpdated(address indexed attestor, VerificationStatus status);
    event VerificationRequested(bytes32 indexed requestId, address indexed assetOwner, bytes32 indexed assetId, uint8 requiredType, uint256 requestedAt, uint256 deadline, uint256 fee);
    event VerificationCompleted(bytes32 indexed requestId, VerificationStatus status, address indexed attestor);
    event StakeWithdrawn(address indexed attestor, uint256 amount);
    event TierRequirementsUpdated(AttestorTier tier, TierRequirements requirements);

    constructor(address _feeRecipient, address _trustToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        
        feeRecipient = _feeRecipient;
        trustToken = IERC20(_trustToken);
        
        // Initialize tier requirements
        _initializeTierRequirements();
    }

    function _initializeTierRequirements() internal {
        // Tier 1: Basic
        string[] memory basicDocs = new string[](4);
        basicDocs[0] = "Government ID";
        basicDocs[1] = "Proof of Address";
        basicDocs[2] = "Professional License";
        basicDocs[3] = "Resume";
        
        tierRequirements[AttestorTier.BASIC] = TierRequirements({
            stakingRequirement: 1000 * 10**18, // 1,000 TRUST
            registrationFee: 25 * 10**18, // $25
            experienceRequirement: 1,
            requiredDocuments: basicDocs
        });
        
        // Tier 2: Professional
        string[] memory professionalDocs = new string[](4);
        professionalDocs[0] = "Government ID";
        professionalDocs[1] = "Proof of Address";
        professionalDocs[2] = "Professional License";
        professionalDocs[3] = "Resume";
        
        tierRequirements[AttestorTier.PROFESSIONAL] = TierRequirements({
            stakingRequirement: 5000 * 10**18, // 5,000 TRUST
            registrationFee: 50 * 10**18, // $50
            experienceRequirement: 3,
            requiredDocuments: professionalDocs
        });
        
        // Tier 3: Expert
        string[] memory expertDocs = new string[](5);
        expertDocs[0] = "Government ID";
        expertDocs[1] = "Proof of Address";
        expertDocs[2] = "Professional License";
        expertDocs[3] = "Resume";
        expertDocs[4] = "Background Check";
        
        tierRequirements[AttestorTier.EXPERT] = TierRequirements({
            stakingRequirement: 10000 * 10**18, // 10,000 TRUST
            registrationFee: 100 * 10**18, // $100
            experienceRequirement: 5,
            requiredDocuments: expertDocs
        });
        
        // Tier 4: Master
        string[] memory masterDocs = new string[](6);
        masterDocs[0] = "Government ID";
        masterDocs[1] = "Proof of Address";
        masterDocs[2] = "Professional License";
        masterDocs[3] = "Resume";
        masterDocs[4] = "Background Check";
        masterDocs[5] = "Reference Letters";
        
        tierRequirements[AttestorTier.MASTER] = TierRequirements({
            stakingRequirement: 25000 * 10**18, // 25,000 TRUST
            registrationFee: 250 * 10**18, // $250
            experienceRequirement: 10,
            requiredDocuments: masterDocs
        });
    }

    function registerAttestor(
        uint8 _attestorType,
        uint8 _tier,
        string[] memory _specializations,
        string[] memory _countries,
        uint256 _experienceYears,
        string memory _contactInfo,
        string memory _credentials,
        string[] memory _documentHashes,
        string[] memory _documentTypes
    ) external nonReentrant whenNotPaused {
        require(_tier < 4, "Invalid tier");
        require(!attestorProfiles[msg.sender].isActive, "Already registered");
        require(_experienceYears >= tierRequirements[AttestorTier(_tier)].experienceRequirement, "Insufficient experience");
        
        AttestorTier tier = AttestorTier(_tier);
        TierRequirements memory requirements = tierRequirements[tier];
        
        // Transfer TRUST tokens for staking
        require(trustToken.transferFrom(msg.sender, address(this), requirements.stakingRequirement), "Stake transfer failed");
        
        // Transfer TRUST tokens for registration fee
        require(trustToken.transferFrom(msg.sender, feeRecipient, requirements.registrationFee), "Fee transfer failed");
        
        // Create attestor profile
        attestorProfiles[msg.sender] = AttestorProfile({
            attestorAddress: msg.sender,
            name: _contactInfo, // Using contact info as name for now
            organization: "",
            attestorType: AttestorType(_attestorType),
            tier: tier,
            specializations: _specializations,
            countries: _countries,
            experienceYears: _experienceYears,
            totalVerifications: 0,
            successfulVerifications: 0,
            failedVerifications: 0,
            reputationScore: 100, // Starting reputation
            stakedAmount: requirements.stakingRequirement,
            registrationFee: requirements.registrationFee,
            requiredDocuments: requirements.requiredDocuments,
            uploadedDocuments: _documentTypes,
            status: VerificationStatus.PENDING,
            isActive: true,
            createdAt: block.timestamp,
            lastActivity: block.timestamp,
            contactInfo: _contactInfo,
            credentials: _credentials,
            reviewerNotes: ""
        });
        
        attestors.push(msg.sender);
        totalAttestors++;
        
        _grantRole(ATTESTOR_ROLE, msg.sender);
        
        emit AttestorRegistered(msg.sender, tier, requirements.stakingRequirement);
    }

    function upgradeAttestor(
        uint8 _newTier,
        string[] memory _newSpecializations,
        string[] memory _newCountries,
        string memory _updatedCredentials
    ) external nonReentrant whenNotPaused {
        require(_newTier < 4, "Invalid tier");
        require(attestorProfiles[msg.sender].isActive, "Not registered");
        require(_newTier > uint8(attestorProfiles[msg.sender].tier), "Can only upgrade to higher tier");
        
        AttestorProfile storage profile = attestorProfiles[msg.sender];
        AttestorTier currentTier = profile.tier;
        AttestorTier newTier = AttestorTier(_newTier);
        
        TierRequirements memory currentRequirements = tierRequirements[currentTier];
        TierRequirements memory newRequirements = tierRequirements[newTier];
        
        // Check experience requirement
        require(profile.experienceYears >= newRequirements.experienceRequirement, "Insufficient experience");
        
        // Calculate additional stake needed
        uint256 additionalStake = newRequirements.stakingRequirement - profile.stakedAmount;
        uint256 upgradeFee = newRequirements.registrationFee;
        uint256 totalCost = additionalStake + upgradeFee;
        
        // Transfer additional TRUST tokens for staking
        if (additionalStake > 0) {
            require(trustToken.transferFrom(msg.sender, address(this), additionalStake), "Additional stake transfer failed");
        }
        
        // Transfer TRUST tokens for upgrade fee
        require(trustToken.transferFrom(msg.sender, feeRecipient, upgradeFee), "Upgrade fee transfer failed");
        
        // Update attestor profile
        profile.tier = newTier;
        profile.specializations = _newSpecializations;
        profile.countries = _newCountries;
        profile.credentials = _updatedCredentials;
        profile.stakedAmount = newRequirements.stakingRequirement;
        profile.registrationFee = upgradeFee;
        profile.requiredDocuments = newRequirements.requiredDocuments;
        profile.lastActivity = block.timestamp;
        
        emit AttestorUpgraded(msg.sender, currentTier, newTier, additionalStake, upgradeFee);
    }

    function requestVerification(
        bytes32 _assetId,
        uint8 _requiredType,
        string[] memory _evidenceHashes,
        string[] memory _documentTypes,
        uint256 _deadline
    ) external nonReentrant whenNotPaused {
        require(_deadline > block.timestamp, "Invalid deadline");
        require(_evidenceHashes.length == _documentTypes.length, "Mismatched arrays");
        
        bytes32 requestId = keccak256(abi.encodePacked(msg.sender, _assetId, block.timestamp));
        uint256 fee = 100 * 10**18; // 100 TRUST tokens fee
        
        // Transfer TRUST tokens for verification fee
        require(trustToken.transferFrom(msg.sender, feeRecipient, fee), "Fee transfer failed");
        
        verificationRequests[requestId] = VerificationRequest({
            requestId: requestId,
            assetOwner: msg.sender,
            assetId: _assetId,
            requiredType: _requiredType,
            evidenceHashes: _evidenceHashes,
            documentTypes: _documentTypes,
            requestedAt: block.timestamp,
            deadline: _deadline,
            status: VerificationStatus.PENDING,
            comments: "",
            fee: fee,
            assignedAttestor: address(0)
        });
        
        userRequests[msg.sender].push(requestId);
        allVerificationRequestIds.push(requestId);
        totalVerificationRequests++;
        activeVerificationRequests++;
        
        emit VerificationRequested(requestId, msg.sender, _assetId, _requiredType, block.timestamp, _deadline, fee);
    }

    function approveVerification(bytes32 _requestId, string memory _comments) external onlyRole(VERIFIER_ROLE) {
        require(verificationRequests[_requestId].assetOwner != address(0), "Request does not exist");
        require(verificationRequests[_requestId].status == VerificationStatus.PENDING, "Invalid status");
        
        verificationRequests[_requestId].status = VerificationStatus.APPROVED;
        verificationRequests[_requestId].comments = _comments;
        verificationRequests[_requestId].assignedAttestor = msg.sender;
        
        if (activeVerificationRequests > 0) {
            activeVerificationRequests--;
        }
        
        // Update attestor stats
        if (attestorProfiles[msg.sender].isActive) {
            attestorProfiles[msg.sender].totalVerifications++;
            attestorProfiles[msg.sender].successfulVerifications++;
            attestorProfiles[msg.sender].reputationScore += 10;
            attestorProfiles[msg.sender].lastActivity = block.timestamp;
        }
        
        emit VerificationCompleted(_requestId, VerificationStatus.APPROVED, msg.sender);
    }

    function rejectVerification(bytes32 _requestId, string memory _comments) external onlyRole(VERIFIER_ROLE) {
        require(verificationRequests[_requestId].assetOwner != address(0), "Request does not exist");
        require(verificationRequests[_requestId].status == VerificationStatus.PENDING, "Invalid status");
        
        verificationRequests[_requestId].status = VerificationStatus.REJECTED;
        verificationRequests[_requestId].comments = _comments;
        verificationRequests[_requestId].assignedAttestor = msg.sender;
        
        if (activeVerificationRequests > 0) {
            activeVerificationRequests--;
        }
        
        // Update attestor stats
        if (attestorProfiles[msg.sender].isActive) {
            attestorProfiles[msg.sender].totalVerifications++;
            attestorProfiles[msg.sender].failedVerifications++;
            attestorProfiles[msg.sender].reputationScore = attestorProfiles[msg.sender].reputationScore > 10 ? 
                attestorProfiles[msg.sender].reputationScore - 10 : 0;
            attestorProfiles[msg.sender].lastActivity = block.timestamp;
        }
        
        emit VerificationCompleted(_requestId, VerificationStatus.REJECTED, msg.sender);
    }

    function updateAttestorStatus(address _attestor, uint8 _status, string memory _reviewerNotes) external onlyRole(VERIFIER_ROLE) {
        require(attestorProfiles[_attestor].isActive, "Attestor not found");
        
        attestorProfiles[_attestor].status = VerificationStatus(_status);
        attestorProfiles[_attestor].reviewerNotes = _reviewerNotes;
        attestorProfiles[_attestor].lastActivity = block.timestamp;
        
        emit AttestorStatusUpdated(_attestor, VerificationStatus(_status));
    }

    function withdrawStake() external nonReentrant {
        require(attestorProfiles[msg.sender].isActive, "Not an active attestor");
        require(attestorProfiles[msg.sender].status == VerificationStatus.APPROVED, "Not approved");
        
        uint256 stakedAmount = attestorProfiles[msg.sender].stakedAmount;
        attestorProfiles[msg.sender].stakedAmount = 0;
        attestorProfiles[msg.sender].isActive = false;
        
        require(trustToken.transfer(msg.sender, stakedAmount), "Stake withdrawal failed");
        
        emit StakeWithdrawn(msg.sender, stakedAmount);
    }

    // View functions
    function getAttestorProfile(address attestor) external view returns (AttestorProfile memory) {
        return attestorProfiles[attestor];
    }

    function getVerificationRequest(bytes32 requestId) external view returns (VerificationRequest memory) {
        return verificationRequests[requestId];
    }

    function getUserRequests(address user) external view returns (bytes32[] memory) {
        return userRequests[user];
    }

    function getAllVerificationRequests() external view returns (VerificationRequest[] memory) {
        VerificationRequest[] memory allRequests = new VerificationRequest[](allVerificationRequestIds.length);
        
        for (uint i = 0; i < allVerificationRequestIds.length; i++) {
            allRequests[i] = verificationRequests[allVerificationRequestIds[i]];
        }
        
        return allRequests;
    }

    function getAttestorsByType(AttestorType attestorType) external view returns (address[] memory) {
        address[] memory result = new address[](totalAttestors);
        uint256 count = 0;
        
        for (uint i = 0; i < attestors.length; i++) {
            if (attestorProfiles[attestors[i]].attestorType == attestorType) {
                result[count] = attestors[i];
                count++;
            }
        }
        
        return result;
    }

    function getAttestorsByCountry(string memory country) external view returns (address[] memory) {
        address[] memory result = new address[](totalAttestors);
        uint256 count = 0;
        
        for (uint i = 0; i < attestors.length; i++) {
            string[] memory countries = attestorProfiles[attestors[i]].countries;
            for (uint j = 0; j < countries.length; j++) {
                if (keccak256(abi.encodePacked(countries[j])) == keccak256(abi.encodePacked(country))) {
                    result[count] = attestors[i];
                    count++;
                    break;
                }
            }
        }
        
        return result;
    }

    function getAttestorsByTier(AttestorTier tier) external view returns (address[] memory) {
        address[] memory result = new address[](totalAttestors);
        uint256 count = 0;
        
        for (uint i = 0; i < attestors.length; i++) {
            if (attestorProfiles[attestors[i]].tier == tier) {
                result[count] = attestors[i];
                count++;
            }
        }
        
        return result;
    }

    function getAllAttestors() external view returns (address[] memory) {
        return attestors;
    }

    function getTierRequirements(AttestorTier tier) external view returns (TierRequirements memory) {
        return tierRequirements[tier];
    }

    function getTotalAttestors() external view returns (uint256) {
        return totalAttestors;
    }

    function getTotalVerificationRequests() external view returns (uint256) {
        return totalVerificationRequests;
    }

    function isAttestor(address account) external view returns (bool) {
        return attestorProfiles[account].isActive;
    }

    function getAttestorTier(address attestor) external view returns (AttestorTier) {
        return attestorProfiles[attestor].tier;
    }

    function getAttestorStatus(address attestor) external view returns (VerificationStatus) {
        return attestorProfiles[attestor].status;
    }

    function getAttestorStake(address attestor) external view returns (uint256) {
        return attestorProfiles[attestor].stakedAmount;
    }

    // Admin functions
    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function updateTierRequirements(AttestorTier tier, TierRequirements memory requirements) external onlyRole(DEFAULT_ADMIN_ROLE) {
        tierRequirements[tier] = requirements;
        emit TierRequirementsUpdated(tier, requirements);
    }

    function withdrawFees() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = feeRecipient.call{value: balance}("");
        require(success, "Fee withdrawal failed");
    }
}
