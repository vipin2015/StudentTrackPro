// server/devRoutes.ts
import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from './db'; // adjust this import path based on your project

const router = Router();

router.post('/api/dev/create-admin', async (req, res) => {
  try {
    const existing = await db.user.findUnique({
      where: { email: 'admin@institute.edu' },
    });

    if (existing) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashedPassword = await bcrypt.hash('admin@123', 10);

    await db.user.create({
      data: {
        email: 'admin@institute.edu',
        password: hashedPassword,
        role: 'admin',
      },
    });

    res.json({ message: 'Admin user created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create admin user' });
  }
});

export default router;
