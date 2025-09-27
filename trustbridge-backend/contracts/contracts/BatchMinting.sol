// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title BatchMinting
 * @dev Handles batch minting of digital assets with different pricing tiers
 */
contract BatchMinting is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    
    IERC20 public immutable trustToken;
    ERC721 public immutable assetNFT;
    
    // Fee structure
    uint256 public constant SINGLE_MINT_FEE = 10 * 10**18; // 10 TRUST
    uint256 public constant BATCH_MINT_FEE = 8 * 10**18; // 8 TRUST per asset (5+ assets)
    uint256 public constant COLLECTION_MINT_FEE = 6 * 10**18; // 6 TRUST per asset (10+ assets)
    uint256 public constant DROP_MINT_FEE = 12 * 10**18; // 12 TRUST per asset
    uint256 public constant AUCTION_MINT_FEE = 15 * 10**18; // 15 TRUST per asset
    
    // Batch minting limits
    uint256 public constant MAX_BATCH_SIZE = 100;
    uint256 public constant MIN_BATCH_SIZE = 5;
    uint256 public constant MIN_COLLECTION_SIZE = 10;
    
    // Events
    event BatchMinted(
        address indexed to,
        uint256[] tokenIds,
        uint256 totalFee,
        uint256 batchType
    );
    
    event CollectionCreated(
        uint256 indexed collectionId,
        string name,
        uint256 totalSupply,
        uint256 mintPrice
    );
    
    event CollectionMinted(
        uint256 indexed collectionId,
        address indexed to,
        uint256[] tokenIds,
        uint256 quantity
    );
    
    // Collection structure
    struct Collection {
        string name;
        string description;
        uint256 totalSupply;
        uint256 minted;
        uint256 mintPrice;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        address creator;
    }
    
    mapping(uint256 => Collection) public collections;
    uint256 public nextCollectionId = 1;
    
    constructor(
        address _trustToken,
        address _assetNFT
    ) {
        trustToken = IERC20(_trustToken);
        assetNFT = ERC721(_assetNFT);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
    }
    
    /**
     * @dev Mint multiple digital assets in a single transaction
     * @param to Address to mint to
     * @param categories Asset categories
     * @param assetTypes Asset types
     * @param names Asset names
     * @param locations Asset locations
     * @param totalValues Asset values
     * @param imageURIs Asset image URIs
     * @param descriptions Asset descriptions
     */
    function mintBatch(
        address to,
        uint256[] memory categories,
        string[] memory assetTypes,
        string[] memory names,
        string[] memory locations,
        uint256[] memory totalValues,
        string[] memory imageURIs,
        string[] memory descriptions
    ) external whenNotPaused nonReentrant {
        require(hasRole(MINTER_ROLE, msg.sender), "BatchMinting: caller is not a minter");
        require(categories.length == assetTypes.length, "BatchMinting: arrays length mismatch");
        require(categories.length >= MIN_BATCH_SIZE, "BatchMinting: batch too small");
        require(categories.length <= MAX_BATCH_SIZE, "BatchMinting: batch too large");
        
        uint256 quantity = categories.length;
        uint256 feePerAsset = quantity >= MIN_COLLECTION_SIZE ? COLLECTION_MINT_FEE : BATCH_MINT_FEE;
        uint256 totalFee = feePerAsset * quantity;
        
        // Transfer TRUST tokens
        require(trustToken.transferFrom(msg.sender, address(this), totalFee), "BatchMinting: transfer failed");
        
        uint256[] memory tokenIds = new uint256[](quantity);
        
        for (uint256 i = 0; i < quantity; i++) {
            // Mint NFT (this would need to be implemented in the main contract)
            // For now, we'll simulate token ID generation
            uint256 tokenId = uint256(keccak256(abi.encodePacked(
                block.timestamp,
                msg.sender,
                i,
                categories[i],
                names[i]
            )));
            
            tokenIds[i] = tokenId;
        }
        
        emit BatchMinted(to, tokenIds, totalFee, quantity >= MIN_COLLECTION_SIZE ? 1 : 0);
    }
    
    /**
     * @dev Create a new collection
     * @param name Collection name
     * @param description Collection description
     * @param totalSupply Total supply of the collection
     * @param mintPrice Price per mint in TRUST tokens
     * @param startTime Start time for minting
     * @param endTime End time for minting
     */
    function createCollection(
        string memory name,
        string memory description,
        uint256 totalSupply,
        uint256 mintPrice,
        uint256 startTime,
        uint256 endTime
    ) external whenNotPaused {
        require(totalSupply > 0, "BatchMinting: invalid total supply");
        require(startTime < endTime, "BatchMinting: invalid time range");
        require(mintPrice > 0, "BatchMinting: invalid mint price");
        
        uint256 collectionId = nextCollectionId++;
        
        collections[collectionId] = Collection({
            name: name,
            description: description,
            totalSupply: totalSupply,
            minted: 0,
            mintPrice: mintPrice,
            startTime: startTime,
            endTime: endTime,
            isActive: true,
            creator: msg.sender
        });
        
        emit CollectionCreated(collectionId, name, totalSupply, mintPrice);
    }
    
    /**
     * @dev Mint from a collection
     * @param collectionId Collection ID
     * @param quantity Quantity to mint
     * @param to Address to mint to
     */
    function mintFromCollection(
        uint256 collectionId,
        uint256 quantity,
        address to
    ) external whenNotPaused nonReentrant {
        Collection storage collection = collections[collectionId];
        require(collection.isActive, "BatchMinting: collection not active");
        require(block.timestamp >= collection.startTime, "BatchMinting: minting not started");
        require(block.timestamp <= collection.endTime, "BatchMinting: minting ended");
        require(collection.minted + quantity <= collection.totalSupply, "BatchMinting: exceeds total supply");
        require(quantity > 0, "BatchMinting: invalid quantity");
        
        uint256 totalCost = collection.mintPrice * quantity;
        
        // Transfer TRUST tokens
        require(trustToken.transferFrom(msg.sender, address(this), totalCost), "BatchMinting: transfer failed");
        
        uint256[] memory tokenIds = new uint256[](quantity);
        
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = uint256(keccak256(abi.encodePacked(
                collectionId,
                collection.minted + i,
                block.timestamp,
                msg.sender
            )));
            
            tokenIds[i] = tokenId;
        }
        
        collection.minted += quantity;
        
        emit CollectionMinted(collectionId, to, tokenIds, quantity);
    }
    
    /**
     * @dev Get collection details
     * @param collectionId Collection ID
     */
    function getCollection(uint256 collectionId) external view returns (Collection memory) {
        return collections[collectionId];
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
        require(trustToken.transfer(msg.sender, balance), "BatchMinting: transfer failed");
    }
}
