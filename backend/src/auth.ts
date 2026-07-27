import { createClient } from '@supabase/supabase-js';
import type { NextFunction, Request, Response } from 'express';

function supabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function requireAuthentication(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const supabase = supabaseClient();
  if (!supabase)
    return response
      .status(503)
      .json({ error: 'Supabase authentication is not configured on the server.' });
  const authorization = request.header('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) return response.status(401).json({ error: 'Authentication is required.' });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user)
    return response.status(401).json({ error: 'Authentication is required.' });
  return next();
}
