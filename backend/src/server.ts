import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createApp } from './app.js';

const port = Number(process.env.PORT ?? 3000);
const prisma = new PrismaClient();
const app = createApp(prisma);

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
