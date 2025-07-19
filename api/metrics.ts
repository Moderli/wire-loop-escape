import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are required.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;

  if (!ip) {
    return res.status(400).json({ error: 'IP address not found' });
  }

  try {
    if (req.method === 'GET') {
      const { count, error: countError } = await supabase
        .from('metrics')
        .select('*', { count: 'exact', head: true });
      if (countError) throw countError;

      let userTimeSpent = 0;
      const { data: user, error: userError } = await supabase
        .from('metrics')
        .select('time_spent')
        .eq('ip_address', ip)
        .single();

      if (user) {
        userTimeSpent = user.time_spent;
      } else if (userError && userError.code !== 'PGRST116') {
        throw userError;
      }

      return res.status(200).json({ visitors: count ?? 0, timeSpent: userTimeSpent });
    }

    if (req.method === 'POST') {
      const { nickname, timeSpent } = req.body;

      if (nickname) {
        const { error } = await supabase
          .from('metrics')
          .upsert({ ip_address: ip, name: nickname }, { onConflict: 'ip_address' });
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ message: 'User created/updated' });
      }

      if (timeSpent !== undefined) {
        const { data: user } = await supabase.from('metrics').select('time_spent').eq('ip_address', ip).single();
        if (user) {
          const { error: updateError } = await supabase
            .from('metrics')
            .update({ time_spent: (user.time_spent || 0) + timeSpent })
            .eq('ip_address', ip);
          if (updateError) throw updateError;
        }
        return res.status(200).json({ message: 'Time updated' });
      }

      return res.status(400).json({ error: 'Invalid POST request body' });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    const err = error as any;
    return res.status(500).json({ error: err.message, details: err.details });
  }
} 