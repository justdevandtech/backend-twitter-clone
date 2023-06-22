"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUser = exports.LoginUser = exports.CreateUser = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const useEncryption_1 = require("./../../hook/useEncryption");
async function CreateUser(req, res) {
    const body = req.body;
    const { hashPassword } = (0, useEncryption_1.useEncryption)();
    try {
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: body.email },
        });
        if (existingUser) {
            return res.status(res.statusCode).json({
                error: 'User already exists',
            });
        }
        const _hashPassword = hashPassword(body.password);
        body.password = _hashPassword;
        const user = await prisma_1.default.user.create({
            data: body,
        });
        if (user) {
            return res.status(200).json({
                success: true,
                message: 'User created successfully',
            });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
exports.CreateUser = CreateUser;
async function LoginUser(req, res) {
    const { email, password } = req.body;
    const { compareHashed, generateToken } = (0, useEncryption_1.useEncryption)();
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password is required.' });
    }
    try {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'Invalid email or password' });
        }
        const passwordMatch = compareHashed(password, user.password);
        if (!passwordMatch) {
            return res.status(404).json({ error: 'Invalid credentials' });
        }
        const payload = {
            id: user.id,
            email: user.email,
        };
        const accessToken = generateToken(payload);
        return res.status(200).json({ accessToken });
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
exports.LoginUser = LoginUser;
function validateUser(req, res) {
    return res.status(200).json(req.user);
}
exports.validateUser = validateUser;
