// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

/**
 * @title AdvancedMinting
 * @dev Handles advanced minting features like rarity, attributes, whitelist, and drops
 */
contract AdvancedMinting is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    
    IERC20 public immutable trustToken;
    ERC721 public immutable assetNFT;
    
    // Rarity levels
    enum RarityLevel {
        COMMON,     // 0
        UNCOMMON,   // 1
        RARE,       // 2
        EPIC,       // 3
        LEGENDARY   // 4
    }
    
    // Rarity pricing
    mapping(RarityLevel => uint256) public rarityPricing;
    
    // Whitelist management
    mapping(bytes32 => bool) public whitelistMerkleRoots;
    mapping(address => bool) public whitelistClaimed;
    
    // Drop management
    struct Drop {
        string name;
        string description;
        uint256 totalSupply;
        uint256 minted;
        uint256 mintPrice;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        RarityLevel rarity;
        bytes32 merkleRoot;
    }
    
    mapping(uint256 => Drop) public drops;
    uint256 public nextDropId = 1;
    
    // Attribute system
    struct Attribute {
        string name;
        string value;
        uint256 rarity;
    }
    
    mapping(uint256 => Attribute[]) public tokenAttributes;
    
    // Events
    event RarityMinted(
        address indexed to,
        uint256 indexed tokenId,
        RarityLevel rarity,
        uint256 price
    );
    
    event AttributeMinted(
        address indexed to,
        uint256 indexed tokenId,
        Attribute[] attributes
    );
    
    event WhitelistMinted(
        address indexed to,
        uint256 indexed tokenId,
        bytes32 indexed merkleRoot
    );
    
    event DropCreated(
        uint256 indexed dropId,
        string name,
        RarityLevel rarity,
        uint256 totalSupply
    );
    
    event DropMinted(
        uint256 indexed dropId,
        address indexed to,
        uint256[] tokenIds,
        uint256 quantity
    );
    
    constructor(
        address _trustToken,
        address _assetNFT
    ) {
        trustToken = IERC20(_trustToken);
        assetNFT = ERC721(_assetNFT);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
        
        // Initialize rarity pricing
        rarityPricing[RarityLevel.COMMON] = 5 * 10**18;    // 5 TRUST
        rarityPricing[RarityLevel.UNCOMMON] = 10 * 10**18;  // 10 TRUST
        rarityPricing[RarityLevel.RARE] = 25 * 10**18;      // 25 TRUST
        rarityPricing[RarityLevel.EPIC] = 50 * 10**18;      // 50 TRUST
        rarityPricing[RarityLevel.LEGENDARY] = 100 * 10**18; // 100 TRUST
    }
    
    /**
     * @dev Mint with specific rarity level
     * @param to Address to mint to
     * @param rarity Rarity level
     * @param metadataURI Metadata URI
     */
    function mintWithRarity(
        address to,
        RarityLevel rarity,
        string memory metadataURI
    ) external whenNotPaused nonReentrant {
        require(hasRole(MINTER_ROLE, msg.sender), "AdvancedMinting: caller is not a minter");
        
        uint256 price = rarityPricing[rarity];
        require(trustToken.transferFrom(msg.sender, address(this), price), "AdvancedMinting: transfer failed");
        
        uint256 tokenId = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            uint256(rarity),
            metadataURI
        )));
        
        emit RarityMinted(to, tokenId, rarity, price);
    }
    
    /**
     * @dev Mint with custom attributes
     * @param to Address to mint to
     * @param metadataURI Metadata URI
     * @param attributes Array of attributes
     */
    function mintWithAttributes(
        address to,
        string memory metadataURI,
        Attribute[] memory attributes
    ) external whenNotPaused nonReentrant {
        require(hasRole(MINTER_ROLE, msg.sender), "AdvancedMinting: caller is not a minter");
        require(attributes.length > 0, "AdvancedMinting: no attributes provided");
        
        uint256 basePrice = 10 * 10**18; // Base price
        uint256 attributePrice = attributes.length * 2 * 10**18; // 2 TRUST per attribute
        uint256 totalPrice = basePrice + attributePrice;
        
        require(trustToken.transferFrom(msg.sender, address(this), totalPrice), "AdvancedMinting: transfer failed");
        
        uint256 tokenId = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            metadataURI,
            attributes.length
        )));
        
        // Store attributes
        for (uint256 i = 0; i < attributes.length; i++) {
            tokenAttributes[tokenId].push(attributes[i]);
        }
        
        emit AttributeMinted(to, tokenId, attributes);
    }
    
    /**
     * @dev Mint with whitelist verification
     * @param to Address to mint to
     * @param metadataURI Metadata URI
     * @param merkleRoot Merkle root for whitelist
     * @param proof Merkle proof
     */
    function mintWithWhitelist(
        address to,
        string memory metadataURI,
        bytes32 merkleRoot,
        bytes32[] memory proof
    ) external whenNotPaused nonReentrant {
        require(hasRole(MINTER_ROLE, msg.sender), "AdvancedMinting: caller is not a minter");
        require(whitelistMerkleRoots[merkleRoot], "AdvancedMinting: invalid merkle root");
        require(!whitelistClaimed[msg.sender], "AdvancedMinting: already claimed");
        
        // Verify merkle proof
        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        require(MerkleProof.verify(proof, merkleRoot, leaf), "AdvancedMinting: invalid proof");
        
        uint256 price = 5 * 10**18; // Discounted price for whitelist
        require(trustToken.transferFrom(msg.sender, address(this), price), "AdvancedMinting: transfer failed");
        
        uint256 tokenId = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            msg.sender,
            merkleRoot,
            metadataURI
        )));
        
        whitelistClaimed[msg.sender] = true;
        
        emit WhitelistMinted(to, tokenId, merkleRoot);
    }
    
    /**
     * @dev Create a new drop
     * @param name Drop name
     * @param description Drop description
     * @param totalSupply Total supply
     * @param mintPrice Mint price
     * @param startTime Start time
     * @param endTime End time
     * @param rarity Rarity level
     * @param merkleRoot Merkle root for whitelist (optional)
     */
    function createDrop(
        string memory name,
        string memory description,
        uint256 totalSupply,
        uint256 mintPrice,
        uint256 startTime,
        uint256 endTime,
        RarityLevel rarity,
        bytes32 merkleRoot
    ) external onlyRole(MANAGER_ROLE) {
        require(totalSupply > 0, "AdvancedMinting: invalid total supply");
        require(startTime < endTime, "AdvancedMinting: invalid time range");
        require(mintPrice > 0, "AdvancedMinting: invalid mint price");
        
        uint256 dropId = nextDropId++;
        
        drops[dropId] = Drop({
            name: name,
            description: description,
            totalSupply: totalSupply,
            minted: 0,
            mintPrice: mintPrice,
            startTime: startTime,
            endTime: endTime,
            isActive: true,
            rarity: rarity,
            merkleRoot: merkleRoot
        });
        
        if (merkleRoot != bytes32(0)) {
            whitelistMerkleRoots[merkleRoot] = true;
        }
        
        emit DropCreated(dropId, name, rarity, totalSupply);
    }
    
    /**
     * @dev Mint from a drop
     * @param dropId Drop ID
     * @param quantity Quantity to mint
     * @param to Address to mint to
     * @param proof Merkle proof (if whitelist)
     */
    function mintFromDrop(
        uint256 dropId,
        uint256 quantity,
        address to,
        bytes32[] memory proof
    ) external whenNotPaused nonReentrant {
        Drop storage drop = drops[dropId];
        require(drop.isActive, "AdvancedMinting: drop not active");
        require(block.timestamp >= drop.startTime, "AdvancedMinting: drop not started");
        require(block.timestamp <= drop.endTime, "AdvancedMinting: drop ended");
        require(drop.minted + quantity <= drop.totalSupply, "AdvancedMinting: exceeds total supply");
        require(quantity > 0, "AdvancedMinting: invalid quantity");
        
        // Check whitelist if required
        if (drop.merkleRoot != bytes32(0)) {
            require(!whitelistClaimed[msg.sender], "AdvancedMinting: already claimed");
            bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
            require(MerkleProof.verify(proof, drop.merkleRoot, leaf), "AdvancedMinting: invalid proof");
            whitelistClaimed[msg.sender] = true;
        }
        
        uint256 totalCost = drop.mintPrice * quantity;
        require(trustToken.transferFrom(msg.sender, address(this), totalCost), "AdvancedMinting: transfer failed");
        
        uint256[] memory tokenIds = new uint256[](quantity);
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = uint256(keccak256(abi.encodePacked(
                dropId,
                drop.minted + i,
                block.timestamp,
                msg.sender
            )));
            
            tokenIds[i] = tokenId;
        }
        
        drop.minted += quantity;
        
        emit DropMinted(dropId, to, tokenIds, quantity);
    }
    
    /**
     * @dev Get token attributes
     * @param tokenId Token ID
     */
    function getTokenAttributes(uint256 tokenId) external view returns (Attribute[] memory) {
        return tokenAttributes[tokenId];
    }
    
    /**
     * @dev Get drop details
     * @param dropId Drop ID
     */
    function getDrop(uint256 dropId) external view returns (Drop memory) {
        return drops[dropId];
    }
    
    /**
     * @dev Set rarity pricing
     * @param rarity Rarity level
     * @param price Price in TRUST tokens
     */
    function setRarityPricing(RarityLevel rarity, uint256 price) external onlyRole(MANAGER_ROLE) {
        rarityPricing[rarity] = price;
    }
    
    /**
     * @dev Pause the contract
     */
    function pause() external onlyRole(MANAGER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyRole(MANAGER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Withdraw TRUST tokens
     */
    function withdraw() external onlyRole(MANAGER_ROLE) {
        uint256 balance = trustToken.balanceOf(address(this));
        require(trustToken.transfer(msg.sender, balance), "AdvancedMinting: transfer failed");
    }
}
