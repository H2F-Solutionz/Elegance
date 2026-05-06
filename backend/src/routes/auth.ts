import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

/**
 * POST /api/auth/register
 * Body: { email, password, display_name? }
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, display_name } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            res.status(409).json({ error: 'User with this email already exists' });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Check if first user
        const userCount = await User.countDocuments();
        const role = userCount === 0 ? 'admin' : 'user';

        // Create user
        const user = await User.create({
            email: email.toLowerCase(),
            password: hashedPassword,
            display_name: display_name || null,
            role: role
        });

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            user: {
                id: user._id,
                email: user.email,
                display_name: user.display_name,
                avatar_url: user.avatar_url,
                role: user.role,
            },
            session: {
                access_token: token,
            },
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Check if user is blocked
        if (user.is_blocked) {
            res.status(403).json({ error: 'Your account has been blocked' });
            return;
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            user: {
                id: user._id,
                email: user.email,
                display_name: user.display_name,
                avatar_url: user.avatar_url,
                role: user.role,
            },
            session: {
                access_token: token,
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * GET /api/auth/me
 * Requires: Authorization Bearer token
 */
router.get('/me', async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }

        res.json({
            id: user._id,
            email: user.email,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
            role: user.role,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

/**
 * PUT /api/auth/profile
 * Requires: Authorization Bearer token
 * Body: { display_name?, avatar_url? }
 */
router.put('/profile', async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

        const { display_name, avatar_url } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            { 
                ...(display_name !== undefined && { display_name }),
                ...(avatar_url !== undefined && { avatar_url })
            },
            { new: true }
        ).select('-password');

        if (!updatedUser) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            id: updatedUser._id,
            email: updatedUser.email,
            display_name: updatedUser.display_name,
            avatar_url: updatedUser.avatar_url,
            role: updatedUser.role,
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export default router;
