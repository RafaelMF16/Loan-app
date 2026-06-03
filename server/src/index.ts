import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { itemsRouter } from './routes/items.routes';
import { loansRouter } from './routes/loans.routes';
import { adminRouter } from './routes/admin.routes';
import { dashboardRouter } from './routes/dashboard.routes';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(cors({ origin: 'http://localhost:4200' }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/items', itemsRouter);
app.use('/api/loans', loansRouter);
app.use('/api/admin', adminRouter);
app.use('/api/dashboard', dashboardRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
