import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
export declare class UsersService {
    private userModel;
    constructor(userModel: Model<UserDocument>);
    getAllUsers(): Promise<User[]>;
    getUserById(userId: string): Promise<User>;
    getUserByWalletAddress(walletAddress: string): Promise<User>;
}
