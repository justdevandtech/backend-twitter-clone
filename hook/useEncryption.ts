import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

export const useEncryption = () => {
  const hashPassword = (password: string) => {
    const saltRounds = 10;
    return bcrypt.hashSync(password, saltRounds);
  };

  const compareHashed = (plain: string, hashed: string) =>
    bcrypt.compareSync(plain, hashed);

  const generateToken = (payload: any) => {
    const secrete = process.env.JWT_SECRET_KEY as any;
    const token = jwt.sign(payload, secrete, {
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
