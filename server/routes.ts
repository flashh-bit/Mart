import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { db, AdminAuthContext, supabase } from './db.js';

export const apiRouter = express.Router();

// Storage Rules: Whitelist of allowed image MIME types and safe file extensions
const ALLOWED_STORAGE_MIMES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const MAX_STORAGE_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

// Setup multer to hold files in memory for direct Supabase upload
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_STORAGE_FILE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_STORAGE_MIMES[file.mimetype]) {
      cb(null, true);
    } else {
      cb(new Error('Storage rule violation: Only JPEG, PNG, WebP, and GIF images are permitted'));
    }
  }
});

// Rate limiting store for failed login attempts to prevent brute-force attacks
const LOGIN_ATTEMPTS = new Map<string, { count: number; lockedUntil: number }>();

function createSession(email: string): string {
  const secret = process.env.SESSION_SECRET || 'fallback-secret-do-not-use-in-prod';
  return jwt.sign({ email }, secret, { expiresIn: '7d' });
}

function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{1,100}$/.test(id);
}

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.SESSION_SECRET || 'fallback-secret-do-not-use-in-prod';
  
  try {
    const payload = jwt.verify(token, secret) as { email: string };
    (req as any).adminEmail = payload.email;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }
}

// Helper to construct authorized context for database writes
function getAuthContext(req: Request): AdminAuthContext {
  return {
    adminEmail: (req as any).adminEmail || '',
  };
}

// ================= PUBLIC READ-ONLY ROUTES =================

const HEALTH_REQUESTS = new Map<string, number>();

apiRouter.get('/health', async (req: Request, res: Response) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const lastRequest = HEALTH_REQUESTS.get(ip);
  
  // Rate limit: 1 request per minute per IP
  if (lastRequest && now - lastRequest < 60000) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  
  HEALTH_REQUESTS.set(ip, now);
  
  // Clean up old entries occasionally to prevent memory leak
  if (HEALTH_REQUESTS.size > 1000) {
    const oneMinAgo = now - 60000;
    for (const [key, timestamp] of HEALTH_REQUESTS.entries()) {
      if (timestamp < oneMinAgo) HEALTH_REQUESTS.delete(key);
    }
  }

  try {
    await db.getConfig();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false });
  }
});

// 1. Get Shop Config
apiRouter.get('/config', async (_req: Request, res: Response) => {
  try {
    const config = await db.getConfig();
    res.json(config);
  } catch (error) {
    console.error('API Error in /config:', error);
    res.status(500).json({ error: 'Failed to retrieve shop configuration' });
  }
});

// 2. Get Products (with search, category, stock filters)
apiRouter.get('/products', async (req: Request, res: Response) => {
  try {
    const { category, search, inStockOnly } = req.query;
    const products = await db.getProducts({
      category: category ? String(category).trim() : undefined,
      search: search ? String(search).trim() : undefined,
      inStockOnly: inStockOnly === 'true',
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// 3. Get Single Product
apiRouter.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const product = await db.getProductById(id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});

// ================= AUTH ROUTES =================

// Admin Login (with rate-limiting and constant-time check)
apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const cleanEmail = String(email).toLowerCase().trim();
  const attemptKey = `${clientIp}_${cleanEmail}`;
  const attemptInfo = LOGIN_ATTEMPTS.get(attemptKey);

  if (attemptInfo && attemptInfo.lockedUntil > Date.now()) {
    const remainingSec = Math.ceil((attemptInfo.lockedUntil - Date.now()) / 1000);
    return res.status(429).json({
      error: `Too many failed login attempts. Account temporarily locked for security. Please try again in ${remainingSec} seconds.`
    });
  }

  const isValid = db.verifyAdmin(cleanEmail, String(password));
  if (!isValid) {
    const currentCount = (attemptInfo?.count || 0) + 1;
    if (currentCount >= 5) {
      LOGIN_ATTEMPTS.set(attemptKey, { count: currentCount, lockedUntil: Date.now() + 15 * 60 * 1000 });
      return res.status(429).json({
        error: 'Too many failed login attempts. Account locked for 15 minutes for security.'
      });
    } else {
      LOGIN_ATTEMPTS.set(attemptKey, { count: currentCount, lockedUntil: 0 });
      return res.status(401).json({
        error: `Invalid email or password. (${5 - currentCount} attempt${5 - currentCount === 1 ? '' : 's'} remaining)`
      });
    }
  }

  // Clear attempts on success
  LOGIN_ATTEMPTS.delete(attemptKey);

  db.recordAdminLogin(cleanEmail);
  const token = createSession(cleanEmail);

  res.json({
    success: true,
    token,
    user: {
      email: cleanEmail,
      role: 'owner',
    }
  });
});

// Verify current session
apiRouter.get('/admin/me', requireAdminAuth, (req: Request, res: Response) => {
  res.json({
    authenticated: true,
    email: (req as any).adminEmail,
    role: 'owner'
  });
});

// Logout
apiRouter.post('/admin/logout', requireAdminAuth, (req: Request, res: Response) => {
  // With stateless JWT, logout is handled by the client discarding the token.
  res.json({ success: true, message: 'Logged out successfully' });
});

// Change Password
apiRouter.post('/admin/change-password', requireAdminAuth, (req: Request, res: Response) => {
  return res.status(400).json({ error: 'Passwords must now be changed securely via environment variables.' });
});

// ================= ADMIN PROTECTED ROUTES (STRICT ACCESS RULES) =================

// Update Shop Config
apiRouter.put('/config', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const auth = getAuthContext(req);
    const updated = await db.updateConfig(auth, req.body);
    res.json(updated);
  } catch (error: any) {
    res.status(error.message?.includes('Database security') ? 403 : 500).json({
      error: error.message || 'Failed to update shop configuration'
    });
  }
});

// Protected Storage Upload (Requires Admin Auth + Strict Type Whitelist)
apiRouter.post('/upload', requireAdminAuth, (req: Request, res: Response) => {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      if ((err as any).code === 'LIMIT_FILE_SIZE' || (err.message && err.message.toLowerCase().includes('large'))) {
        return res.status(400).json({ error: 'Image size exceeds the 5MB limit. Please upload an image under 5MB.' });
      }
      return res.status(400).json({ error: err.message || 'Image upload failed' });
    }

    try {
      if (req.file) {
        const ext = ALLOWED_STORAGE_MIMES[req.file.mimetype] || '.jpg';
        const secureRandom = crypto.randomBytes(16).toString('hex');
        const filename = `${Date.now()}-${secureRandom}${ext}`;
        
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false
        });
        
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filename);
        return res.json({ url: publicUrlData.publicUrl, filename });
      }

      // Support Base64 data URL upload as alternative with strict MIME and size checks
      if (req.body?.base64Image) {
        const matches = req.body.base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          return res.status(400).json({ error: 'Invalid base64 string format' });
        }
        const mime = matches[1].toLowerCase();
        if (!ALLOWED_STORAGE_MIMES[mime]) {
          return res.status(400).json({
            error: 'Storage rule violation: Only JPEG, PNG, WebP, and GIF images are permitted'
          });
        }

        const ext = ALLOWED_STORAGE_MIMES[mime];
        const buffer = Buffer.from(matches[2], 'base64');

        if (buffer.length > MAX_STORAGE_FILE_SIZE) {
          return res.status(400).json({
            error: 'Image size exceeds the 5MB limit. Please upload an image under 5MB.'
          });
        }

        const secureRandom = crypto.randomBytes(16).toString('hex');
        const filename = `${Date.now()}-${secureRandom}${ext}`;
        
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filename, buffer, {
          contentType: mime,
          upsert: false
        });
        
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filename);
        return res.json({ url: publicUrlData.publicUrl, filename });
      }

      res.status(400).json({ error: 'No image file or base64 data provided' });
    } catch (e: any) {
      console.error('Upload error:', e);
      return res.status(500).json({ error: 'Failed to save image to storage: ' + e.message });
    }
  });
});

// Create Product (Requires Admin Auth + Database Rule Enforcement)
apiRouter.post('/products', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { name, price, originalPrice, category, description, imageUrl, inStock, unit, priceOnRequest, department } = req.body;

    if (!name || String(name).trim() === '') {
      return res.status(400).json({ error: 'Product name is required' });
    }
    const isPriceOnReq = Boolean(priceOnRequest);
    if (!isPriceOnReq) {
      if (price === undefined || isNaN(Number(price)) || Number(price) <= 0) {
        return res.status(400).json({ error: 'Price must be a positive number greater than 0' });
      }
    }
    if (originalPrice !== undefined && originalPrice !== null && originalPrice !== '') {
      if (isNaN(Number(originalPrice)) || Number(originalPrice) <= 0) {
        return res.status(400).json({ error: 'Original price must be a positive number greater than 0' });
      }
    }
    if (!category || String(category).trim() === '') {
      return res.status(400).json({ error: 'Product category is required' });
    }

    const auth = getAuthContext(req);
    const newProduct = await db.addProduct(auth, {
      name: String(name).trim(),
      price: isPriceOnReq ? 0 : Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category: String(category).trim(),
      department: department === 'Jewellery' ? 'Jewellery' : 'Kirana',
      unit: unit ? String(unit).trim() : undefined,
      priceOnRequest: isPriceOnReq,
      description: description ? String(description).trim() : '',
      imageUrl: imageUrl ? String(imageUrl).trim() : '',
      inStock: inStock !== undefined ? Boolean(inStock) : true,
    });

    res.status(201).json(newProduct);
  } catch (error: any) {
    res.status(error.message?.includes('Database security') ? 403 : 500).json({
      error: error.message || 'Failed to add product'
    });
  }
});

// Update Product (Requires Admin Auth + Database Rule Enforcement)
apiRouter.put('/products/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const { name, price, originalPrice, priceOnRequest } = req.body;
    if (name !== undefined && String(name).trim() === '') {
      return res.status(400).json({ error: 'Product name cannot be empty' });
    }
    const isPriceOnReq = priceOnRequest !== undefined ? Boolean(priceOnRequest) : undefined;
    if (isPriceOnReq === false && price !== undefined && (isNaN(Number(price)) || Number(price) <= 0)) {
      return res.status(400).json({ error: 'Price must be a positive number greater than 0' });
    }
    if (originalPrice !== undefined && originalPrice !== null && originalPrice !== '') {
      if (isNaN(Number(originalPrice)) || Number(originalPrice) <= 0) {
        return res.status(400).json({ error: 'Original price must be a positive number greater than 0' });
      }
    }

    const payload = {
      ...req.body,
      price: req.body.price !== undefined ? Number(req.body.price) : undefined,
      originalPrice: req.body.originalPrice !== undefined
        ? (req.body.originalPrice ? Number(req.body.originalPrice) : null)
        : undefined,
      unit: req.body.unit !== undefined ? (req.body.unit ? String(req.body.unit).trim() : undefined) : undefined,
      priceOnRequest: isPriceOnReq,
    };

    const auth = getAuthContext(req);
    const updated = await db.updateProduct(auth, id, payload);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(error.message?.includes('Database security') ? 403 : 500).json({
      error: error.message || 'Failed to update product'
    });
  }
});

// Toggle Stock Status (Requires Admin Auth + Database Rule Enforcement)
apiRouter.patch('/products/:id/stock', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const auth = getAuthContext(req);
    const updated = await db.toggleProductStock(auth, id);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(updated);
  } catch (error: any) {
    res.status(error.message?.includes('Database security') ? 403 : 500).json({
      error: error.message || 'Failed to toggle product stock'
    });
  }
});

// Delete Product (Requires Admin Auth + Database Rule Enforcement)
apiRouter.delete('/products/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid product ID format' });
    }

    const auth = getAuthContext(req);
    const success = await db.deleteProduct(auth, id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error: any) {
    res.status(error.message?.includes('Database security') ? 403 : 500).json({
      error: error.message || 'Failed to delete product'
    });
  }
});
