import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Extend Express Request to include user info
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email?: string;
                role?: string;
            };
        }
    }
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

/**
 * Middleware: Verify JWT token from Authorization header.
 * Attaches user info to req.user.
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Missing or invalid authorization header' });
            return;
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            res.status(401).json({ error: 'Invalid or expired token' });
            return;
        }

        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        };

        next();
    } catch (err) {
        res.status(401).json({ error: 'Authentication failed — invalid token' });
    }
};

/**
 * Middleware: Check if authenticated user has the 'admin' role.
 * Must be used AFTER requireAuth.
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }

        if (req.user.role !== 'admin') {
            res.status(403).json({ error: 'Forbidden: Admin access required' });
            return;
        }

        next();
    } catch (err) {
        res.status(500).json({ error: 'Authorization check failed' });
    }
};

// Alias for backward compatibility
export const authenticate = requireAuth;
