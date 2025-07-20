import { createClient } from '@supabase/supabase-js';
import { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are required.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async (req: VercelRequest, res: VercelResponse) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';

  if (!ip) {
    return res.status(400).json({ error: 'IP address not found.' });
  }

  try {
    let { data: user, error } = await supabase
      .from('users')
      .select('id, nickname')
      .eq('ip_address', ip)
      .single();

    if (error && error.code !== 'PGRST116') { // Ignore 'not found' error
      throw error;
    }

    if (!user) {
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert({ ip_address: ip, nickname: `Player${Math.floor(Math.random() * 10000)}` })
        .select('id, nickname')
        .single();

      if (insertError) throw insertError;
      user = newUser;
    }

    return res.status(200).json({ id: user.id, nickname: user.nickname });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}; 