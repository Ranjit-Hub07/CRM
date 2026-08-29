import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Lead, Customer, Deal, Activity, Notification } from '../models/Schemas.js';


// ════════════════════════════════════════════════════════════════════
// SYSTEM HELPERS
// ════════════════════════════════════════════════════════════════════
async function logSystemActivity({ title, notes = '', leadId, customerId, dealId, createdBy }) {
  try {
    await Activity.create({ type: 'Note', title, notes, leadId, customerId, dealId, createdBy, status: 'Completed' });
  } catch (err) { console.error('Error logging activity:', err); }
}

async function createSystemNotification({ title, body, type, createdFor }) {
  try {
    if (!createdFor) return;
    await Notification.create({ title, body, type, createdFor });
  } catch (err) { console.error('Error creating notification:', err); }
}

// ════════════════════════════════════════════════════════════════════
// AUTH

// ════════════════════════════════════════════════════════════════════

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const updates = {};
    const allowed = ['name', 'phone', 'region', 'avatar'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ════════════════════════════════════════════════════════════════════
// LEADS
// ════════════════════════════════════════════════════════════════════

export async function getLeads(req, res) {
  try {
    const { page = 1, limit = 20, status, priority, source, assignedTo, search } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (priority && priority !== 'All') filter.priority = priority;
    if (source && source !== 'All') filter.source = source;
    if (assignedTo && assignedTo !== 'All') filter.assignedTo = assignedTo;

    // Role-based filtering — Executives see only their own leads
    if (req.user.role === 'Executive') {
      filter.assignedTo = req.user.id;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [leads, total] = await Promise.all([
      Lead.find(filter).populate('assignedTo', 'name email avatar').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Lead.countDocuments(filter),
    ]);

    res.json({ leads, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getLeadStats(req, res) {
  try {
    const filter = req.user.role === 'Executive' ? { assignedTo: req.user.id } : {};
    const [total, newCount, qualified, unqualified] = await Promise.all([
      Lead.countDocuments(filter),
      Lead.countDocuments({ ...filter, status: 'New' }),
      Lead.countDocuments({ ...filter, status: 'Qualified' }),
      Lead.countDocuments({ ...filter, status: 'Unqualified' }),
    ]);
    res.json({ total, new: newCount, qualified, unqualified });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createLead(req, res) {
  try {
    const assignedTo = req.body.assignedTo || req.user.id;
    const lead = await Lead.create({ ...req.body, assignedTo });
    
    await logSystemActivity({ title: 'Lead Created', notes: 'Lead was created.', leadId: lead._id, createdBy: req.user.id });
    
    if (assignedTo.toString() !== req.user.id.toString()) {
      await createSystemNotification({ title: 'New lead assigned', body: `${lead.name} has been assigned to you.`, type: 'lead', createdFor: assignedTo });
    }
    
    res.status(201).json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateLead(req, res) {
  try {
    const oldLead = await Lead.findById(req.params.id);
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('assignedTo', 'name email avatar');
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    if (oldLead && req.body.status && oldLead.status !== req.body.status) {
      await logSystemActivity({ title: 'Lead Status Changed', notes: `Status changed from ${oldLead.status} to ${req.body.status}.`, leadId: lead._id, createdBy: req.user.id });
    }
    
    if (oldLead && req.body.assignedTo && oldLead.assignedTo?.toString() !== req.body.assignedTo.toString()) {
      await logSystemActivity({ title: 'Lead Reassigned', notes: `Lead assigned to ${lead.assignedTo?.name || 'someone else'}.`, leadId: lead._id, createdBy: req.user.id });
      if (req.body.assignedTo.toString() !== req.user.id.toString()) {
        await createSystemNotification({ title: 'Lead reassigned', body: `${lead.name} has been assigned to you.`, type: 'lead', createdFor: req.body.assignedTo });
      }
    }

    res.json(lead);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function convertLead(req, res) {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    // Create customer from lead
    const customer = await Customer.create({
      name: lead.company || lead.name,
      contactPerson: lead.name,
      email: lead.email,
      phone: lead.phone,
      plan: req.body.plan || 'Starter',
      arr: req.body.arr || 0,
      status: 'Active',
      health: 80,
      originalLeadId: lead._id,
    });

    // Create deal from lead
    const deal = await Deal.create({
      name: `${lead.company || lead.name} — Initial Deal`,
      value: req.body.dealValue || 50000,
      stage: 'Qualification',
      probability: 20,
      expectedClosingDate: new Date(Date.now() + 90 * 86400000),
      leadId: lead._id,
      customerId: customer._id,
      ownerId: lead.assignedTo || req.user.id,
    });

    // Mark lead as Qualified
    lead.status = 'Qualified';
    await lead.save();

    await logSystemActivity({ title: 'Lead Converted', notes: 'Lead was converted into a Customer and Deal.', leadId: lead._id, customerId: customer._id, dealId: deal._id, createdBy: req.user.id });
    await logSystemActivity({ title: 'Deal Created from Lead', notes: `Initial deal created for ${customer.name}.`, dealId: deal._id, customerId: customer._id, createdBy: req.user.id });
    
    if (deal.ownerId.toString() !== req.user.id.toString()) {
      await createSystemNotification({ title: 'New deal created', body: `${deal.name} has been assigned to you from a converted lead.`, type: 'deal', createdFor: deal.ownerId });
    }

    res.json({ customer, deal, lead });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ════════════════════════════════════════════════════════════════════
// CUSTOMERS
// ════════════════════════════════════════════════════════════════════

export async function getCustomers(req, res) {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Customer.countDocuments(filter),
    ]);
    res.json({ customers, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getCustomerStats(req, res) {
  try {
    const [total, active, atRisk, churned] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ status: 'Active' }),
      Customer.countDocuments({ status: 'At Risk' }),
      Customer.countDocuments({ status: 'Churned' }),
    ]);
    const arrResult = await Customer.aggregate([{ $group: { _id: null, total: { $sum: '$arr' } } }]);
    const totalArr = arrResult[0]?.total || 0;
    res.json({ total, active, atRisk, churned, totalArr });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createCustomer(req, res) {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateCustomer(req, res) {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ════════════════════════════════════════════════════════════════════
// DEALS
// ════════════════════════════════════════════════════════════════════

export async function getDeals(req, res) {
  try {
    const { stage, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (req.user.role === 'Executive') filter.ownerId = req.user.id;
    if (stage && stage !== 'All') filter.stage = stage;
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [deals, total] = await Promise.all([
      Deal.find(filter).populate('ownerId', 'name avatar').populate('customerId', 'name').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Deal.countDocuments(filter),
    ]);
    res.json({ deals, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getDealStats(req, res) {
  try {
    const filter = req.user.role === 'Executive' ? { ownerId: req.user.id } : {};
    const stages = ['Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'];
    const pipeline = stages.map((s) => Deal.countDocuments({ ...filter, stage: s }));
    const valuePipeline = stages.map((s) =>
      Deal.aggregate([{ $match: { ...filter, stage: s } }, { $group: { _id: null, total: { $sum: '$value' } } }])
    );
    const [counts, values] = await Promise.all([
      Promise.all(pipeline),
      Promise.all(valuePipeline),
    ]);
    const result = {};
    stages.forEach((s, i) => {
      result[s] = { count: counts[i], value: values[i][0]?.total || 0 };
    });
    const totalValue = await Deal.aggregate([{ $match: filter }, { $group: { _id: null, total: { $sum: '$value' } } }]);
    res.json({ stages: result, totalValue: totalValue[0]?.total || 0, totalDeals: await Deal.countDocuments(filter) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createDeal(req, res) {
  try {
    const deal = await Deal.create({ ...req.body, ownerId: req.body.ownerId || req.user.id });
    res.status(201).json(deal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateDeal(req, res) {
  try {
    const oldDeal = await Deal.findById(req.params.id);
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('ownerId', 'name avatar')
      .populate('customerId', 'name');
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    if (oldDeal && req.body.ownerId && oldDeal.ownerId?.toString() !== req.body.ownerId.toString()) {
      await logSystemActivity({ title: 'Deal Reassigned', notes: `Deal assigned to ${deal.ownerId?.name || 'someone else'}.`, dealId: deal._id, customerId: deal.customerId?._id, createdBy: req.user.id });
      if (req.body.ownerId.toString() !== req.user.id.toString()) {
        await createSystemNotification({ title: 'Deal reassigned', body: `${deal.name} has been assigned to you.`, type: 'deal', createdFor: req.body.ownerId });
      }
    }

    res.json(deal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateDealStage(req, res) {
  try {
    const { stage, probability } = req.body;
    const oldDeal = await Deal.findById(req.params.id);
    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      { stage, ...(probability !== undefined && { probability }) },
      { new: true }
    ).populate('ownerId', 'name avatar').populate('customerId', 'name');
    if (!deal) return res.status(404).json({ message: 'Deal not found' });

    if (oldDeal && oldDeal.stage !== stage) {
      await logSystemActivity({ title: 'Deal Stage Changed', notes: `Stage changed from ${oldDeal.stage} to ${stage}.`, dealId: deal._id, customerId: deal.customerId?._id, createdBy: req.user.id });
      
      if (stage === 'Won') {
        await createSystemNotification({ title: 'Deal Won!', body: `${deal.name} was won.`, type: 'deal', createdFor: deal.ownerId?._id });
      } else if (stage === 'Lost') {
        await createSystemNotification({ title: 'Deal Lost', body: `${deal.name} was marked as lost.`, type: 'deal', createdFor: deal.ownerId?._id });
      }
    }

    res.json(deal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ════════════════════════════════════════════════════════════════════
// ACTIVITIES
// ════════════════════════════════════════════════════════════════════

export async function getActivities(req, res) {
  try {
    const { type, status, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (req.user.role === 'Executive') filter.createdBy = req.user.id;
    if (type && type !== 'All') filter.type = type;
    if (status && status !== 'All') filter.status = status;
    const skip = (Number(page) - 1) * Number(limit);
    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate('createdBy', 'name avatar')
        .populate('leadId', 'name company')
        .populate('dealId', 'name')
        .sort({ date: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Activity.countDocuments(filter),
    ]);
    res.json({ activities, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getActivityStats(req, res) {
  try {
    const filter = req.user.role === 'Executive' ? { createdBy: req.user.id } : {};
    const [total, pending, completed, calls, emails, meetings, overdue] = await Promise.all([
      Activity.countDocuments(filter),
      Activity.countDocuments({ ...filter, status: 'Pending' }),
      Activity.countDocuments({ ...filter, status: 'Completed' }),
      Activity.countDocuments({ ...filter, type: 'Call' }),
      Activity.countDocuments({ ...filter, type: 'Email' }),
      Activity.countDocuments({ ...filter, type: 'Meeting' }),
      Activity.countDocuments({ ...filter, status: 'Pending', date: { $lt: new Date() } }),
    ]);
    res.json({ total, pending, completed, calls, emails, meetings, overdue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createActivity(req, res) {
  try {
    const activity = await Activity.create({ ...req.body, createdBy: req.user.id });
    const populated = await activity.populate('createdBy', 'name avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function toggleActivityStatus(req, res) {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    activity.status = activity.status === 'Pending' ? 'Completed' : 'Pending';
    await activity.save();
    res.json(activity);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ════════════════════════════════════════════════════════════════════

export async function getNotifications(req, res) {
  try {
    const { type, read, page = 1, limit = 30 } = req.query;
    const filter = { createdFor: req.user.id };
    if (type && type !== 'All') filter.type = type;
    if (read !== undefined) filter.read = read === 'true';
    const skip = (Number(page) - 1) * Number(limit);
    const [notifications, total, unread] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ createdFor: req.user.id, read: false }),
    ]);
    res.json({ notifications, total, unread, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, createdFor: req.user.id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function markAllNotificationsRead(req, res) {
  try {
    await Notification.updateMany({ createdFor: req.user.id, read: false }, { read: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ════════════════════════════════════════════════════════════════════
// TEAM
// ════════════════════════════════════════════════════════════════════

export async function getTeamMembers(req, res) {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });

    // Enrich each user with performance metrics
    const enriched = await Promise.all(
      users.map(async (u) => {
        const [leadCount, dealCount, wonDeals, activityCount] = await Promise.all([
          Lead.countDocuments({ assignedTo: u._id }),
          Deal.countDocuments({ ownerId: u._id }),
          Deal.aggregate([{ $match: { ownerId: u._id, stage: 'Won' } }, { $group: { _id: null, total: { $sum: '$value' } } }]),
          Activity.countDocuments({ createdBy: u._id }),
        ]);
        return {
          ...u.toObject(),
          leads: leadCount,
          deals: dealCount,
          wonRevenue: wonDeals[0]?.total || 0,
          activities: activityCount,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ════════════════════════════════════════════════════════════════════
// DASHBOARD / REPORTS
// ════════════════════════════════════════════════════════════════════

export async function getDashboardStats(req, res) {
  try {
    const filter = req.user.role === 'Executive' ? { assignedTo: req.user.id } : {};
    const dealFilter = req.user.role === 'Executive' ? { ownerId: req.user.id } : {};

    const [
      totalLeads, newLeads, qualifiedLeads,
      totalCustomers, activeCustomers,
      totalDeals, wonDealsAgg,
      totalActivities, pendingActivities,
      recentActivities,
      leadsBySource,
      dealsByStage,
    ] = await Promise.all([
      Lead.countDocuments(filter),
      Lead.countDocuments({ ...filter, status: 'New' }),
      Lead.countDocuments({ ...filter, status: 'Qualified' }),
      Customer.countDocuments(),
      Customer.countDocuments({ status: 'Active' }),
      Deal.countDocuments(dealFilter),
      Deal.aggregate([{ $match: { ...dealFilter, stage: 'Won' } }, { $group: { _id: null, total: { $sum: '$value' } } }]),
      Activity.countDocuments(req.user.role === 'Executive' ? { createdBy: req.user.id } : {}),
      Activity.countDocuments({ ...(req.user.role === 'Executive' ? { createdBy: req.user.id } : {}), status: 'Pending' }),
      Activity.find(req.user.role === 'Executive' ? { createdBy: req.user.id } : {})
        .populate('createdBy', 'name avatar')
        .sort({ date: -1 })
        .limit(5),
      Lead.aggregate([{ $match: filter }, { $group: { _id: '$source', count: { $sum: 1 } } }]),
      Deal.aggregate([{ $match: dealFilter }, { $group: { _id: '$stage', count: { $sum: 1 }, value: { $sum: '$value' } } }]),
    ]);

    const totalRevenue = wonDealsAgg[0]?.total || 0;

    // Convert arrays to objects
    const sources = {};
    leadsBySource.forEach((s) => { sources[s._id] = s.count; });
    const stages = {};
    dealsByStage.forEach((s) => { stages[s._id] = { count: s.count, value: s.value }; });

    res.json({
      leads: { total: totalLeads, new: newLeads, qualified: qualifiedLeads },
      customers: { total: totalCustomers, active: activeCustomers },
      deals: { total: totalDeals, totalRevenue, stages },
      activities: { total: totalActivities, pending: pendingActivities, recent: recentActivities },
      leadsBySource: sources,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getReportsOverview(req, res) {
  try {
    // Revenue by month (last 6 months from Won deals)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [revenueByMonth, conversionRate, topAccounts, repPerformance] = await Promise.all([
      Deal.aggregate([
        { $match: { stage: 'Won', updatedAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$updatedAt' } },
            revenue: { $sum: '$value' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      (async () => {
        const totalLeads = await Lead.countDocuments();
        const convertedLeads = await Lead.countDocuments({ status: 'Qualified' });
        return totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
      })(),
      Customer.find({ status: 'Active' }).sort({ arr: -1 }).limit(5),
      (async () => {
        const users = await User.find({ role: { $in: ['Executive', 'Manager'] } }).select('-password');
        return Promise.all(
          users.map(async (u) => {
            const wonAgg = await Deal.aggregate([
              { $match: { ownerId: u._id, stage: 'Won' } },
              { $group: { _id: null, total: { $sum: '$value' }, count: { $sum: 1 } } },
            ]);
            const dealCount = await Deal.countDocuments({ ownerId: u._id });
            return {
              id: u._id,
              name: u.name,
              role: u.role,
              avatar: u.avatar,
              wonRevenue: wonAgg[0]?.total || 0,
              wonDeals: wonAgg[0]?.count || 0,
              totalDeals: dealCount,
              winRate: dealCount > 0 ? Math.round(((wonAgg[0]?.count || 0) / dealCount) * 100) : 0,
            };
          })
        );
      })(),
    ]);

    res.json({ revenueByMonth, conversionRate, topAccounts, repPerformance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ════════════════════════════════════════════════════════════════════
// USERS (Admin)
// ════════════════════════════════════════════════════════════════════

export async function getAllUsers(req, res) {
  try {
    const users = await User.find().select('-password').sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, role, region, avatar } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      region,
      avatar,
    });
    
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json(userObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, password, role, region, avatar } = req.body;
    
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email.toLowerCase();
    if (role) updates.role = role;
    if (region !== undefined) updates.region = region;
    if (avatar !== undefined) updates.avatar = avatar;
    
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }
    
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
