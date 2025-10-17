import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Initialize database schema
async function initializeDatabase() {
  try {
    // Check if schema is initialized
    const schemaCheck = await kv.get('schema_initialized');
    if (schemaCheck) {
      console.log('Database schema already initialized');
      return;
    }

    console.log('Initializing database schema...');
    await kv.set('schema_initialized', 'true');
    console.log('Database schema initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Initialize on startup
initializeDatabase();

// Health check
app.get('/make-server-f0a9c31f/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Sign up endpoint
app.post('/make-server-f0a9c31f/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`profile:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role: 'user',
      created_at: new Date().toISOString(),
    });

    return c.json({ 
      success: true, 
      user: { id: data.user.id, email, name },
      message: 'Account created successfully' 
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

// Submit quote endpoint (can be used both authenticated and guest)
app.post('/make-server-f0a9c31f/quote', async (c) => {
  try {
    const quoteData = await c.req.json();
    const accessToken = c.req.header('Authorization')?.split(' ')[1];

    let userId = 'guest';
    let userEmail = quoteData.email;

    // Check if user is authenticated
    if (accessToken && accessToken !== Deno.env.get('SUPABASE_ANON_KEY')) {
      const { data: { user }, error } = await supabase.auth.getUser(accessToken);
      if (user && !error) {
        userId = user.id;
        userEmail = user.email || quoteData.email;
      }
    }

    // Create quote
    const quoteId = crypto.randomUUID();
    const quote = {
      id: quoteId,
      user_id: userId,
      pickup_location: quoteData.pickupLocation,
      delivery_location: quoteData.deliveryLocation,
      vehicle: quoteData.vehicle,
      transport_type: quoteData.transportType,
      name: quoteData.name,
      email: userEmail,
      phone: quoteData.phone,
      status: 'new',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await kv.set(`quote:${quoteId}`, quote);
    
    // Add to user's quote list
    if (userId !== 'guest') {
      const userQuotesKey = `user_quotes:${userId}`;
      const existingQuotes = await kv.get(userQuotesKey) || [];
      await kv.set(userQuotesKey, [...existingQuotes, quoteId]);
    }

    return c.json({ 
      success: true, 
      quote: { id: quoteId, ...quote },
      message: 'Quote submitted successfully' 
    });
  } catch (error) {
    console.error('Quote submission error:', error);
    return c.json({ error: 'Failed to submit quote' }, 500);
  }
});

// Get user's quotes (authenticated)
app.get('/make-server-f0a9c31f/quotes/my', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Get user's quote IDs
    const userQuotesKey = `user_quotes:${user.id}`;
    const quoteIds = await kv.get(userQuotesKey) || [];

    // Fetch all quotes
    const quotes = [];
    for (const quoteId of quoteIds) {
      const quote = await kv.get(`quote:${quoteId}`);
      if (quote) {
        quotes.push(quote);
      }
    }

    // Sort by created_at (newest first)
    quotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ success: true, quotes });
  } catch (error) {
    console.error('Get quotes error:', error);
    return c.json({ error: 'Failed to fetch quotes' }, 500);
  }
});

// Get all quotes (admin only)
app.get('/make-server-f0a9c31f/quotes/all', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const profile = await kv.get(`profile:${user.id}`);
    if (!profile || profile.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    // Get all quotes
    const allQuotes = await kv.getByPrefix('quote:');
    
    // Sort by created_at (newest first)
    allQuotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return c.json({ success: true, quotes: allQuotes });
  } catch (error) {
    console.error('Get all quotes error:', error);
    return c.json({ error: 'Failed to fetch quotes' }, 500);
  }
});

// Update quote status (admin only)
app.patch('/make-server-f0a9c31f/quotes/:id/status', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if user is admin
    const profile = await kv.get(`profile:${user.id}`);
    if (!profile || profile.role !== 'admin') {
      return c.json({ error: 'Forbidden - Admin access required' }, 403);
    }

    const quoteId = c.req.param('id');
    const { status } = await c.req.json();

    if (!['new', 'quoted', 'booked', 'in_transit', 'completed', 'cancelled'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }

    const quote = await kv.get(`quote:${quoteId}`);
    if (!quote) {
      return c.json({ error: 'Quote not found' }, 404);
    }

    quote.status = status;
    quote.updated_at = new Date().toISOString();
    await kv.set(`quote:${quoteId}`, quote);

    return c.json({ success: true, quote });
  } catch (error) {
    console.error('Update quote status error:', error);
    return c.json({ error: 'Failed to update quote status' }, 500);
  }
});

// Newsletter subscription
app.post('/make-server-f0a9c31f/newsletter', async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }

    const subscriberId = crypto.randomUUID();
    const subscriber = {
      id: subscriberId,
      email,
      subscribed_at: new Date().toISOString(),
    };

    await kv.set(`newsletter:${subscriberId}`, subscriber);

    return c.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter' 
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return c.json({ error: 'Failed to subscribe' }, 500);
  }
});

// Get user profile
app.get('/make-server-f0a9c31f/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken || accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (!user || error) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`profile:${user.id}`);
    
    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json({ success: true, profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

Deno.serve(app.fetch);
