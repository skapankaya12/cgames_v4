import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../invite/open';

export default async function openInvite(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}


