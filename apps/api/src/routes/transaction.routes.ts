import { Router } from 'express';
import { 
  createTransaction, 
  getTransactions, 
  getDailyStats 
} from '../controllers/transaction.controller';

const router = Router();

router.post('/', createTransaction);
router.get('/', getTransactions);
router.get('/stats/daily', getDailyStats);

export default router;
