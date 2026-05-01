import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/user.repository';
import { JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const SALT_ROUNDS = 10;

interface AuthResult {
  token: string;
  user: { id: number; name: string; email: string };
}

export const authService = {
  async login(email: string, password: string): Promise<AuthResult> {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new Error('Credenciais inválidas.');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new Error('Credenciais inválidas.');

    const payload: JwtPayload = { userId: user.id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return { token, user: { id: user.id, name: user.name, email: user.email } };
  },

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new Error('Este e-mail já está em uso.');

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.create(name, email, hashedPassword);

    const payload: JwtPayload = { userId: user.id, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return { token, user: { id: user.id, name: user.name, email: user.email } };
  },
};
