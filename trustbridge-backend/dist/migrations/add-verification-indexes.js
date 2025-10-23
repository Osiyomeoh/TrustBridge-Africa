"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeVerificationIndexes = exports.addVerificationIndexes = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const models_1 = require("../models");
const addVerificationIndexes = async () => {
    try {
        console.log('Adding verification system indexes...');
        await models_1.VerificationRequestModel.collection.createIndex({ status: 1, createdAt: -1 }, { name: 'status_createdAt_idx' });
        console.log('✅ Created index: status_createdAt_idx');
        await models_1.VerificationRequestModel.collection.createIndex({ assetType: 1, 'metadata.country': 1 }, { name: 'assetType_country_idx' });
        console.log('✅ Created index: assetType_country_idx');
        await models_1.VerificationRequestModel.collection.createIndex({ assignedAttestors: 1, status: 1 }, { name: 'assignedAttestors_status_idx' });
        console.log('✅ Created index: assignedAttestors_status_idx');
        await models_1.VerificationRequestModel.collection.createIndex({ expiresAt: 1 }, { name: 'expiresAt_idx' });
        console.log('✅ Created index: expiresAt_idx');
        await models_1.VerificationRequestModel.collection.createIndex({ ownerAddress: 1, createdAt: -1 }, { name: 'ownerAddress_createdAt_idx' });
        console.log('✅ Created index: ownerAddress_createdAt_idx');
        console.log('🎉 All verification indexes created successfully!');
    }
    catch (error) {
        console.error('❌ Error creating verification indexes:', error);
        throw error;
    }
};
exports.addVerificationIndexes = addVerificationIndexes;
const removeVerificationIndexes = async () => {
    try {
        console.log('Removing verification system indexes...');
        const indexesToRemove = [
            'status_createdAt_idx',
            'assetType_country_idx',
            'assignedAttestors_status_idx',
            'expiresAt_idx',
            'ownerAddress_createdAt_idx',
            'type_country_status_idx',
            'specialties_status_reputation_idx',
            'reputation_status_idx'
        ];
        for (const indexName of indexesToRemove) {
            try {
                await models_1.VerificationRequestModel.collection.dropIndex(indexName);
                console.log(`✅ Removed index: ${indexName}`);
            }
            catch (error) {
                console.log(`⚠️  Index ${indexName} not found or already removed`);
            }
        }
        console.log('🎉 Verification indexes removal completed!');
    }
    catch (error) {
        console.error('❌ Error removing verification indexes:', error);
        throw error;
    }
};
exports.removeVerificationIndexes = removeVerificationIndexes;
if (require.main === module) {
    const runMigration = async () => {
        try {
            await mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/trustbridge');
            console.log('Connected to MongoDB');
            await (0, exports.addVerificationIndexes)();
            await mongoose_1.default.connection.close();
            console.log('Migration completed successfully');
            process.exit(0);
        }
        catch (error) {
            console.error('Migration failed:', error);
            process.exit(1);
        }
    };
    runMigration();
}
//# sourceMappingURL=add-verification-indexes.js.map