import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../superadmin/createCompany';

export default async function createCompany(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}


