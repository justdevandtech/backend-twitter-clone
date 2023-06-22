import { Request, Response } from 'express';
import prisma from '../prisma';
import { useEncryption } from './../../hook/useEncryption';

interface AuthenticatedRequest extends Request {
  user?: any;
}

async function CreateUser(req: Request, res: Response) {
  const body = req.body;
  const { hashPassword } = useEncryption();
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existingUser) {
      return res.status(res.statusCode).json({
        error: 'User already exists',
      });
    }

    const _hashPassword = hashPassword(body.password);
    body.password = _hashPassword;

    const user = await prisma.user.create({
      data: body,
    });

    if (user) {
      return res.status(200).json({
        success: true,
        message: 'User created successfully',
      });
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function LoginUser(req: Request, res: Response) {
  const { email, password } = req.body;
  const { compareHashed, generateToken } = useEncryption();

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password is required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

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
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function validateUser(req: AuthenticatedRequest, res: Response) {
  return res.status(200).json(req.user);
}

export { CreateUser, LoginUser, validateUser };
