import { promises as fs } from 'fs';
import path from 'path';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const dataFilePath = path.join(process.cwd(), 'data.json');

async function readData() {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    return {};
  }
}

async function writeData(data: any) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress) as string;
  const { timeSpent } = req.body;

  if (!ip) {
    return res.status(400).json({ error: 'IP address not found' });
  }

  const data = await readData();

  if (timeSpent !== undefined) {
    if (!data[ip]) {
      data[ip] = { firstSeen: new Date().toISOString(), timeSpent: 0 };
    }
    data[ip].timeSpent += timeSpent;
    await writeData(data);
    return res.status(200).json({ message: 'Time updated' });
  }

  if (!data[ip]) {
    data[ip] = { firstSeen: new Date().toISOString(), timeSpent: 0 };
    await writeData(data);
  }

  return res.status(200).json({
    visitors: Object.keys(data).length,
    timeSpent: data[ip].timeSpent,
  });
} 