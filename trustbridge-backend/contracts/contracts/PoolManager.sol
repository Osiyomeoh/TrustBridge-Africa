// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CoreAssetFactory.sol";

/**
 * @title PoolManager
 * @dev Investment pool management for fractionalized RWA trading
 */
contract PoolManager is AccessControl, Pausable, ReentrancyGuard {
    bytes32 public constant MANAGER_ROLE = keccak256("MANAGER_ROLE");
    bytes32 public constant AMC_ROLE = keccak256("AMC_ROLE");

    CoreAssetFactory public immutable assetFactory;
    IERC20 public immutable trustToken;

    struct Pool {
        bytes32 poolId;
        address creator;
        string name;
        string description;
        uint256 totalValue;
        uint256 totalShares;
        uint256 managementFee; // Basis points
        uint256 performanceFee; // Basis points
        bool isActive;
        uint256 createdAt;
        bytes32[] assets; // Asset IDs in this pool
        mapping(address => uint256) userShares; // User's pool token balance
        mapping(address => uint256) userInvestments; // User's total investment
    }

    mapping(bytes32 => Pool) public pools;
    mapping(address => bytes32[]) public userPools;
    mapping(bytes32 => bytes32) public assetToPool;

    uint256 public totalPools;
    uint256 public totalValueLocked;

    event PoolCreated(bytes32 indexed poolId, address indexed creator, string name, uint256 totalValue);
    event AssetAddedToPool(bytes32 indexed poolId, bytes32 indexed assetId, address indexed amc);
    event PoolTokenIssued(bytes32 indexed poolId, address indexed investor, uint256 amount);
    event PoolTokenTraded(bytes32 indexed poolId, address indexed seller, address indexed buyer, uint256 amount, uint256 price);

    constructor(address _assetFactory, address _trustToken) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANAGER_ROLE, msg.sender);
        _grantRole(AMC_ROLE, msg.sender);
        
        assetFactory = CoreAssetFactory(_assetFactory);
        trustToken = IERC20(_trustToken);
    }

    /**
     * @notice Create investment pool
     */
    function createPool(
        string memory _name,
        string memory _description,
        uint256 _managementFee,
        uint256 _performanceFee
    ) external onlyRole(AMC_ROLE) returns (bytes32) {
        require(_managementFee <= 500, "Management fee too high"); // Max 5%
        require(_performanceFee <= 2000, "Performance fee too high"); // Max 20%

        bytes32 poolId = keccak256(abi.encodePacked(_name, msg.sender, block.timestamp));
        
        // Initialize pool struct (mappings are automatically initialized)
        pools[poolId].poolId = poolId;
        pools[poolId].creator = msg.sender;
        pools[poolId].name = _name;
        pools[poolId].description = _description;
        pools[poolId].totalValue = 0;
        pools[poolId].totalShares = 0;
        pools[poolId].managementFee = _managementFee;
        pools[poolId].performanceFee = _performanceFee;
        pools[poolId].isActive = true;
        pools[poolId].createdAt = block.timestamp;
        pools[poolId].assets = new bytes32[](0);

        userPools[msg.sender].push(poolId);
        totalPools++;

        emit PoolCreated(poolId, msg.sender, _name, 0);
        return poolId;
    }

    /**
     * @notice Add asset to pool
     */
    function addAssetToPool(bytes32 _poolId, bytes32 _assetId) external onlyRole(AMC_ROLE) {
        Pool storage pool = pools[_poolId];
        require(pool.poolId != bytes32(0), "Pool not found");
        require(pool.creator == msg.sender, "Not the pool creator");
        require(pool.isActive, "Pool not active");

        CoreAssetFactory.UniversalAsset memory asset = assetFactory.getAsset(_assetId);
        require(asset.status == CoreAssetFactory.AssetStatus.ACTIVE_AMC_MANAGED, "Asset not AMC managed");
        require(assetToPool[_assetId] == bytes32(0), "Asset already in pool");

        pool.assets.push(_assetId);
        assetToPool[_assetId] = _poolId;

        emit AssetAddedToPool(_poolId, _assetId, msg.sender);
    }

    /**
     * @notice Invest in pool using TRUST tokens
     */
    function investInPool(
        bytes32 _poolId,
        uint256 _amount
    ) external {
        Pool storage pool = pools[_poolId];
        require(pool.poolId != bytes32(0), "Pool not found");
        require(pool.isActive, "Pool not active");
        require(_amount > 0, "Invalid amount");

        // Transfer TRUST tokens from investor to this contract
        require(trustToken.transferFrom(msg.sender, address(this), _amount), "TRUST transfer failed");

        // Calculate pool tokens to issue
        uint256 poolTokens = (pool.totalValue == 0) ? _amount : (_amount * pool.totalShares) / pool.totalValue;
        
        // Update pool
        pool.userShares[msg.sender] += poolTokens;
        pool.userInvestments[msg.sender] += _amount;
        pool.totalValue += _amount;
        pool.totalShares += poolTokens;

        totalValueLocked += _amount;

        emit PoolTokenIssued(_poolId, msg.sender, poolTokens);
    }

    /**
     * @notice Trade pool tokens using TRUST tokens
     */
    function tradePoolTokens(
        bytes32 _poolId,
        address _buyer,
        uint256 _amount,
        uint256 _price
    ) external {
        Pool storage pool = pools[_poolId];
        require(pool.poolId != bytes32(0), "Pool not found");
        require(pool.isActive, "Pool not active");
        require(pool.userShares[msg.sender] >= _amount, "Insufficient shares");
        require(_amount > 0, "Invalid amount");
        require(_price > 0, "Invalid price");

        // Transfer shares
        pool.userShares[msg.sender] -= _amount;
        pool.userShares[_buyer] += _amount;

        // Transfer TRUST tokens as payment
        uint256 totalPrice = _amount * _price;
        require(trustToken.transferFrom(_buyer, msg.sender, totalPrice), "TRUST transfer failed");

        emit PoolTokenTraded(_poolId, msg.sender, _buyer, _amount, _price);
    }

    /**
     * @notice Get pool details
     */
    function getPool(bytes32 _poolId) external view returns (
        bytes32 poolId,
        address creator,
        string memory name,
        string memory description,
        uint256 totalValue,
        uint256 totalShares,
        uint256 managementFee,
        uint256 performanceFee,
        bool isActive,
        uint256 createdAt,
        bytes32[] memory assets
    ) {
        Pool storage pool = pools[_poolId];
        return (
            pool.poolId,
            pool.creator,
            pool.name,
            pool.description,
            pool.totalValue,
            pool.totalShares,
            pool.managementFee,
            pool.performanceFee,
            pool.isActive,
            pool.createdAt,
            pool.assets
        );
    }

    /**
     * @notice Get user pools
     */
    function getUserPools(address _user) external view returns (bytes32[] memory) {
        return userPools[_user];
    }

    /**
     * @notice Get user shares in pool
     */
    function getUserShares(bytes32 _poolId, address _user) external view returns (uint256) {
        return pools[_poolId].userShares[_user];
    }

    /**
     * @notice Get user investment in pool
     */
    function getUserInvestment(bytes32 _poolId, address _user) external view returns (uint256) {
        return pools[_poolId].userInvestments[_user];
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}