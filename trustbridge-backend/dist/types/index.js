"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettlementStatus = exports.OperationStatus = exports.OperationType = exports.AssetStatus = exports.AssetType = void 0;
var AssetType;
(function (AssetType) {
    AssetType["AGRICULTURAL"] = "AGRICULTURAL";
    AssetType["REAL_ESTATE"] = "REAL_ESTATE";
    AssetType["EQUIPMENT"] = "EQUIPMENT";
    AssetType["INVENTORY"] = "INVENTORY";
    AssetType["COMMODITY"] = "COMMODITY";
})(AssetType || (exports.AssetType = AssetType = {}));
var AssetStatus;
(function (AssetStatus) {
    AssetStatus["PENDING"] = "PENDING";
    AssetStatus["VERIFIED"] = "VERIFIED";
    AssetStatus["ACTIVE"] = "ACTIVE";
    AssetStatus["OPERATIONAL"] = "OPERATIONAL";
    AssetStatus["MATURED"] = "MATURED";
    AssetStatus["SETTLED"] = "SETTLED";
})(AssetStatus || (exports.AssetStatus = AssetStatus = {}));
var OperationType;
(function (OperationType) {
    OperationType["CREATION"] = "CREATION";
    OperationType["VERIFICATION"] = "VERIFICATION";
    OperationType["TRANSFER"] = "TRANSFER";
    OperationType["DELIVERY"] = "DELIVERY";
    OperationType["SETTLEMENT"] = "SETTLEMENT";
})(OperationType || (exports.OperationType = OperationType = {}));
var OperationStatus;
(function (OperationStatus) {
    OperationStatus["PENDING"] = "PENDING";
    OperationStatus["IN_PROGRESS"] = "IN_PROGRESS";
    OperationStatus["COMPLETED"] = "COMPLETED";
    OperationStatus["FAILED"] = "FAILED";
})(OperationStatus || (exports.OperationStatus = OperationStatus = {}));
var SettlementStatus;
(function (SettlementStatus) {
    SettlementStatus["PENDING"] = "PENDING";
    SettlementStatus["IN_TRANSIT"] = "IN_TRANSIT";
    SettlementStatus["DELIVERED"] = "DELIVERED";
    SettlementStatus["SETTLED"] = "SETTLED";
    SettlementStatus["DISPUTED"] = "DISPUTED";
})(SettlementStatus || (exports.SettlementStatus = SettlementStatus = {}));
//# sourceMappingURL=index.js.map