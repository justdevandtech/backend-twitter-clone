"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEncryption = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const useEncryption = () => {
    const hashPassword = (password) => {
        const saltRounds = 10;
        return bcrypt_1.default.hashSync(password, saltRounds);
    };
    const compareHashed = (plain, hashed) => bcrypt_1.default.compareSync(plain, hashed);
    const generateToken = (payload) => {
        const secrete = process.env.JWT_SECRET_KEY;
        const token = jsonwebtoken_1.default.sign(payload, secrete, {
            expiresIn: '1h',
        });
        return token;
    };
    return {
        hashPassword,
        compareHashed,
        generateToken,
    };
};
exports.useEncryption = useEncryption;
