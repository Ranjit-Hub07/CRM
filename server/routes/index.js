import { Router } from 'express';
import { verifyToken, isAdmin, isManager } from '../middleware/auth.js';
import * as C from '../controllers/controllers.js';

const router = Router();

// ── Auth ──────────────────────────────────────────────
router.post('/auth/login', C.login);
router.get('/auth/profile', verifyToken, C.getProfile);
router.put('/auth/profile', verifyToken, C.updateProfile);

// ── Leads ─────────────────────────────────────────────
router.get('/leads',          verifyToken, C.getLeads);
router.get('/leads/stats',    verifyToken, C.getLeadStats);
router.post('/leads',         verifyToken, C.createLead);
router.put('/leads/:id',      verifyToken, C.updateLead);
router.post('/leads/:id/convert', verifyToken, C.convertLead);

// ── Customers ─────────────────────────────────────────
router.get('/customers',       verifyToken, C.getCustomers);
router.get('/customers/stats', verifyToken, C.getCustomerStats);
router.post('/customers',      verifyToken, C.createCustomer);
router.put('/customers/:id',   verifyToken, C.updateCustomer);

// ── Deals ─────────────────────────────────────────────
router.get('/deals',           verifyToken, C.getDeals);
router.get('/deals/stats',     verifyToken, C.getDealStats);
router.post('/deals',          verifyToken, C.createDeal);
router.put('/deals/:id',       verifyToken, C.updateDeal);
router.patch('/deals/:id/stage', verifyToken, C.updateDealStage);

// ── Activities ────────────────────────────────────────
router.get('/activities',          verifyToken, C.getActivities);
router.get('/activities/stats',    verifyToken, C.getActivityStats);
router.post('/activities',         verifyToken, C.createActivity);
router.patch('/activities/:id/toggle', verifyToken, C.toggleActivityStatus);

// ── Notifications ─────────────────────────────────────
router.get('/notifications',             verifyToken, C.getNotifications);
router.patch('/notifications/:id/read',  verifyToken, C.markNotificationRead);
router.patch('/notifications/read-all',  verifyToken, C.markAllNotificationsRead);

// ── Team ──────────────────────────────────────────────
router.get('/team', verifyToken, isManager, C.getTeamMembers);

// ── Dashboard / Reports ───────────────────────────────
router.get('/dashboard/stats', verifyToken, C.getDashboardStats);
router.get('/reports/overview', verifyToken, C.getReportsOverview);

// ── Users (Admin) ─────────────────────────────────────
router.get('/users', verifyToken, isAdmin, C.getAllUsers);
router.post('/users', verifyToken, isAdmin, C.createUser);
router.put('/users/:id', verifyToken, isAdmin, C.updateUser);
router.delete('/users/:id', verifyToken, isAdmin, C.deleteUser);

export default router;
