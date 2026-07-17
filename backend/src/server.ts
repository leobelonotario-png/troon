import 'dotenv/config';

import express from 'express';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());

app.get('/health', async (_request, response) => {
  await prisma.$queryRaw`SELECT 1`;
  response.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
