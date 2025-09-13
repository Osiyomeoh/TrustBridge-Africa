// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAttestorManager {
    struct AttestorInfo {
        bool isActive;
        uint256 stakeAmount;
        uint256 reputationScore;
        string organizationType;
        string country;
        uint256 totalAttestations;
        uint256 correctAttestations;
    }

    function registerAttestor(
        address attestor,
        string memory organizationType,
        string memory country,
        uint256 initialStake
    ) external payable;

    function updateAttestorReputation(address attestor, bool wasCorrect) external;
    function slashAttestor(address attestor, string memory reason) external;
    function getAttestorInfo(address attestor) external view returns (AttestorInfo memory);
    function isAttestorActive(address attestor) external view returns (bool);
    function incrementAttestationCount(address attestor) external;
}
