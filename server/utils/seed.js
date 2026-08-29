import bcrypt from 'bcryptjs';
import { User, Lead, Customer, Deal, Activity, Notification } from '../models/Schemas.js';

export async function seedDatabase() {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    console.log('⏭  Database already seeded — skipping.');
    return;
  }

  console.log('🌱 Seeding database …');
  const hash = (pw) => bcrypt.hashSync(pw, 10);

  // ── Users ──────────────────────────────────────────
  const users = await User.insertMany([
    { name: 'Admin User',       email: 'admin@nexuscrm.com',     password: hash('admin123'),    role: 'Admin',     region: 'Pan India' },
    { name: 'Rahul Sharma',     email: 'rahul@nexuscrm.com',     password: hash('manager123'),  role: 'Manager',   region: 'North India' },
    { name: 'Sneha Patel',      email: 'sneha@nexuscrm.com',     password: hash('exec123'),     role: 'Executive', region: 'West India' },
    { name: 'Vikram Singh',     email: 'vikram@nexuscrm.com',    password: hash('exec123'),     role: 'Executive', region: 'North India' },
    { name: 'Priya Sharma',     email: 'priya@nexuscrm.com',     password: hash('exec123'),     role: 'Executive', region: 'South India' },
    { name: 'Arjun Reddy',      email: 'arjun@nexuscrm.com',     password: hash('exec123'),     role: 'Executive', region: 'South India' },
    { name: 'Ananya Desai',     email: 'ananya@nexuscrm.com',    password: hash('exec123'),     role: 'Executive', region: 'West India' },
    { name: 'Ravi Patel',       email: 'ravi@nexuscrm.com',      password: hash('exec123'),     role: 'Executive', region: 'East India' },
  ]);

  const [admin, manager, sneha, vikram, priya, arjun, ananya, ravi] = users;

  // ── Leads ──────────────────────────────────────────
  const leadsData = [
    { name: 'Kavita Menon',      title: 'VP of Operations',       company: 'TechFlow India',      email: 'kavita.m@techflow.in',       phone: '+91 98765 43210', source: 'Website Organic',  status: 'Qualified',   priority: 'High',   assignedTo: sneha._id },
    { name: 'Amitabh Bachchan',  title: 'CTO',                    company: 'DataSync Solutions',  email: 'amitabh@datasync.in',        phone: '+91 98123 45678', source: 'Referral',         status: 'New',         priority: 'Medium', assignedTo: vikram._id },
    { name: 'Deepak Chopra',     title: 'Procurement Director',   company: 'Bharat Logistics',    email: 'dchopra@bharatlog.in',       phone: '+91 99887 76655', source: 'Cold Call',        status: 'Contacted',   priority: 'Low',    assignedTo: arjun._id },
    { name: 'Neha Gupta',        title: 'Marketing Lead',         company: 'Creative Spark Media',email: 'neha@creativespark.in',      phone: '+91 98711 22334', source: 'Webinar Sign-up',  status: 'Unqualified', priority: 'Low',    assignedTo: priya._id },
    { name: 'Sanjay Dutt',       title: 'CEO',                    company: 'MumbaiTech',          email: 'sanjay@mumbaitech.in',       phone: '+91 99999 88888', source: 'Trade Show',       status: 'New',         priority: 'High',   assignedTo: ravi._id },
    { name: 'Aditi Rao',         title: 'Head of Sales',          company: 'Rapid Growth India',  email: 'aditi@rapidgrowth.in',       phone: '+91 91234 56789', source: 'LinkedIn',         status: 'Contacted',   priority: 'High',   assignedTo: sneha._id },
    { name: 'Manoj Bajpayee',    title: 'Engineering Manager',    company: 'BuildIt Builders',    email: 'manoj@buildit.in',           phone: '+91 98765 11111', source: 'Partner',          status: 'Qualified',   priority: 'Medium', assignedTo: ananya._id },
    { name: 'Pooja Hegde',       title: 'Product Director',       company: 'InnoVate Labs India', email: 'pooja@innovatelabs.in',      phone: '+91 90000 12345', source: 'Website Organic',  status: 'New',         priority: 'Medium', assignedTo: vikram._id },
    { name: 'Ritesh Deshmukh',   title: 'IT Director',            company: 'Swasthya Health',     email: 'ritesh@swasthya.in',         phone: '+91 98222 33444', source: 'Referral',         status: 'Contacted',   priority: 'High',   assignedTo: arjun._id },
    { name: 'Simran Kaur',       title: 'Operations Manager',     company: 'SupplyChain Plus',    email: 'simran@scplus.in',           phone: '+91 97111 22233', source: 'Webinar Sign-up',  status: 'New',         priority: 'Low',    assignedTo: priya._id },
    { name: 'Rakesh Jhunjhunwala',title: 'CFO',                   company: 'FinanceWise India',   email: 'rakesh@financewise.in',      phone: '+91 99888 77766', source: 'Cold Call',        status: 'Qualified',   priority: 'High',   assignedTo: sneha._id },
    { name: 'Anushka Sharma',    title: 'VP Marketing',           company: 'BrandPower Media',    email: 'anushka@brandpower.in',      phone: '+91 98777 66554', source: 'Trade Show',       status: 'New',         priority: 'Medium', assignedTo: ananya._id },
    { name: 'Varun Dhawan',      title: 'CTO',                    company: 'CloudFirst India',    email: 'varun@cloudfirst.in',        phone: '+91 98111 22333', source: 'LinkedIn',         status: 'Contacted',   priority: 'Medium', assignedTo: ravi._id },
    { name: 'Kiara Advani',      title: 'Director of Ops',        company: 'ScaleUp Solutions',   email: 'kiara@scaleup.in',           phone: '+91 99000 88776', source: 'Partner',          status: 'Qualified',   priority: 'High',   assignedTo: vikram._id },
    { name: 'Farhan Akhtar',     title: 'VP Engineering',         company: 'DevStream India',     email: 'farhan@devstream.in',        phone: '+91 98999 88877', source: 'Website Organic',  status: 'New',         priority: 'Medium', assignedTo: arjun._id },
  ];
  const leads = await Lead.insertMany(leadsData);

  // ── Customers ──────────────────────────────────────
  const customersData = [
    { name: 'TechFlow India',      contactPerson: 'Kavita Menon',    email: 'accounts@techflow.in',      phone: '+91 98765 43210', plan: 'Enterprise',    arr: 18000000, status: 'Active',  health: 92, originalLeadId: leads[0]._id },
    { name: 'DataSync Solutions',  contactPerson: 'Amitabh Bachchan',email: 'sales@datasync.in',         phone: '+91 98123 45678', plan: 'Professional',  arr: 9500000,  status: 'Active',  health: 78, originalLeadId: leads[1]._id },
    { name: 'BuildIt Builders',    contactPerson: 'Manoj Bajpayee',  email: 'procurement@buildit.in',    phone: '+91 98765 11111', plan: 'Enterprise',    arr: 24000000, status: 'Active',  health: 95 },
    { name: 'ScaleUp Solutions',   contactPerson: 'Kiara Advani',    email: 'info@scaleup.in',           phone: '+91 99000 88776', plan: 'Professional',  arr: 7200000,  status: 'At Risk', health: 45, originalLeadId: leads[13]._id },
    { name: 'FinanceWise India',   contactPerson: 'Rakesh Jhunjhunwala',email: 'support@financewise.in', phone: '+91 99888 77766', plan: 'Enterprise',    arr: 32000000, status: 'Active',  health: 88, originalLeadId: leads[10]._id },
    { name: 'Rapid Growth India',  contactPerson: 'Aditi Rao',       email: 'hello@rapidgrowth.in',      phone: '+91 91234 56789', plan: 'Starter',       arr: 2400000,  status: 'Churned', health: 15 },
    { name: 'InnoVate Labs India', contactPerson: 'Pooja Hegde',     email: 'team@innovatelabs.in',      phone: '+91 90000 12345', plan: 'Professional',  arr: 11000000, status: 'Active',  health: 82 },
    { name: 'CloudFirst India',    contactPerson: 'Varun Dhawan',    email: 'admin@cloudfirst.in',       phone: '+91 98111 22333', plan: 'Enterprise',    arr: 27500000, status: 'Active',  health: 91 },
  ];
  const customers = await Customer.insertMany(customersData);

  // ── Deals ──────────────────────────────────────────
  const dealsData = [
    { name: 'TechFlow Enterprise Upgrade',     value: 18000000, stage: 'Won',           probability: 100, ownerId: sneha._id,  customerId: customers[0]._id, leadId: leads[0]._id, expectedClosingDate: daysFromNow(-15) },
    { name: 'DataSync Pro License',            value: 9500000,  stage: 'Negotiation',   probability: 75,  ownerId: vikram._id, customerId: customers[1]._id, leadId: leads[1]._id, expectedClosingDate: daysFromNow(20) },
    { name: 'Bharat Logistics Platform',       value: 6500000,  stage: 'Discovery',     probability: 40,  ownerId: arjun._id,  leadId: leads[2]._id, expectedClosingDate: daysFromNow(60) },
    { name: 'MumbaiTech Integration',          value: 12000000, stage: 'Qualification', probability: 20,  ownerId: ravi._id,   leadId: leads[4]._id, expectedClosingDate: daysFromNow(90) },
    { name: 'Rapid Growth Expansion',          value: 4800000,  stage: 'Proposal',      probability: 60,  ownerId: sneha._id,  leadId: leads[5]._id, expectedClosingDate: daysFromNow(30) },
    { name: 'BuildIt Builders Annual Renewal', value: 24000000, stage: 'Won',           probability: 100, ownerId: ananya._id, customerId: customers[2]._id, expectedClosingDate: daysFromNow(-5) },
    { name: 'Swasthya Health Transform',       value: 15500000, stage: 'Proposal',      probability: 55,  ownerId: arjun._id,  leadId: leads[8]._id, expectedClosingDate: daysFromNow(45) },
    { name: 'FinanceWise Premium Suite',       value: 32000000, stage: 'Won',           probability: 100, ownerId: sneha._id,  customerId: customers[4]._id, leadId: leads[10]._id, expectedClosingDate: daysFromNow(-30) },
    { name: 'BrandPower Marketing Automation', value: 7800000,  stage: 'Discovery',     probability: 35,  ownerId: ananya._id, leadId: leads[11]._id, expectedClosingDate: daysFromNow(75) },
    { name: 'CloudFirst Migration',            value: 27500000, stage: 'Negotiation',   probability: 80,  ownerId: ravi._id,   customerId: customers[7]._id, leadId: leads[12]._id, expectedClosingDate: daysFromNow(10) },
    { name: 'ScaleUp CRM Integration',         value: 7200000,  stage: 'Lost',          probability: 0,   ownerId: vikram._id, customerId: customers[3]._id, leadId: leads[13]._id, expectedClosingDate: daysFromNow(-20) },
    { name: 'DevStream Enterprise',            value: 19000000, stage: 'Qualification', probability: 25,  ownerId: arjun._id,  leadId: leads[14]._id, expectedClosingDate: daysFromNow(100) },
    { name: 'InnoVate Labs AI Module',         value: 11000000, stage: 'Won',           probability: 100, ownerId: vikram._id, customerId: customers[6]._id, expectedClosingDate: daysFromNow(-10) },
  ];
  const deals = await Deal.insertMany(dealsData);

  // ── Activities ─────────────────────────────────────
  const activitiesData = [
    { type: 'Call',    title: 'Discovery call with Kavita Menon',        notes: 'Discussed enterprise needs and pricing tiers.',      date: daysFromNow(-2),  duration: 45, status: 'Completed', leadId: leads[0]._id,  createdBy: sneha._id },
    { type: 'Email',   title: 'Follow-up proposal to DataSync',          notes: 'Sent revised pricing document with volume discounts.',date: daysFromNow(-1),  duration: 15, status: 'Completed', leadId: leads[1]._id,  createdBy: vikram._id },
    { type: 'Meeting', title: 'Quarterly review with BuildIt Builders',  notes: 'Reviewed Q2 performance metrics and renewal terms.', date: daysFromNow(0),   duration: 60, status: 'Pending',   customerId: customers[2]._id, createdBy: ananya._id },
    { type: 'Demo',    title: 'Product demo for MumbaiTech',             notes: 'Showcased integration capabilities with their stack.',date: daysFromNow(-3),  duration: 90, status: 'Completed', leadId: leads[4]._id,  createdBy: ravi._id },
    { type: 'Call',    title: 'Cold call to Bharat Logistics',           notes: 'Initial contact — interested in platform overview.',  date: daysFromNow(-5),  duration: 20, status: 'Completed', leadId: leads[2]._id,  createdBy: arjun._id },
    { type: 'Note',    title: 'Internal note on FinanceWise strategy',   notes: 'CFO wants custom reporting dashboard integration.',  date: daysFromNow(-1),  duration: 10, status: 'Completed', customerId: customers[4]._id, createdBy: sneha._id },
    { type: 'Email',   title: 'Introduction email to BrandPower',        notes: 'Sent initial capabilities deck and pricing overview.',date: daysFromNow(-4),  duration: 10, status: 'Completed', leadId: leads[11]._id, createdBy: ananya._id },
    { type: 'Meeting', title: 'Negotiation meeting with CloudFirst',     notes: 'Final terms discussion — contract review pending.',   date: daysFromNow(1),   duration: 60, status: 'Pending',   dealId: deals[9]._id,  createdBy: ravi._id },
    { type: 'Call',    title: 'Check-in call with Swasthya Health',      notes: 'Ritesh confirmed budget approval for Q3.',           date: daysFromNow(-1),  duration: 30, status: 'Completed', leadId: leads[8]._id,  createdBy: arjun._id },
    { type: 'Demo',    title: 'Product walkthrough for Aditi Rao',       notes: 'Full CRM demo — requested follow-up proposal.',      date: daysFromNow(-2),  duration: 75, status: 'Completed', leadId: leads[5]._id,  createdBy: sneha._id },
    { type: 'Call',    title: 'Renewal discussion with InnoVate Labs',   notes: 'Planning module upgrade for next quarter.',          date: daysFromNow(2),   duration: 30, status: 'Pending',   customerId: customers[6]._id, createdBy: vikram._id },
    { type: 'Email',   title: 'Proposal to DevStream India',             notes: 'Sent enterprise pricing proposal with SLA terms.',   date: daysFromNow(-3),  duration: 15, status: 'Completed', leadId: leads[14]._id, createdBy: arjun._id },
  ];
  await Activity.insertMany(activitiesData);

  // ── Notifications ──────────────────────────────────
  const notificationsData = [
    { title: 'New lead assigned',       body: 'Kavita Menon from TechFlow has been assigned to you.',       type: 'lead',     createdFor: sneha._id,  read: false },
    { title: 'Deal won!',               body: 'TechFlow Enterprise Upgrade deal closed at ₹1,80,00,000.',   type: 'deal',     createdFor: sneha._id,  read: true },
    { title: 'Meeting reminder',        body: 'Quarterly review with BuildIt Builders starts in 1 hour.',   type: 'activity', createdFor: ananya._id, read: false },
    { title: 'Lead status change',      body: 'Amitabh Bachchan moved from New to Contacted.',              type: 'lead',     createdFor: vikram._id, read: false },
    { title: 'Deal negotiation update', body: 'CloudFirst Migration deal moved to Negotiation stage.',      type: 'deal',     createdFor: ravi._id,   read: false },
    { title: 'System update',           body: 'New CRM features deployed — check the changelog.',           type: 'system',   createdFor: admin._id,  read: false },
    { title: 'Team quota alert',        body: 'Team is at 78% of Q3 target with 4 weeks remaining.',        type: 'team',     createdFor: manager._id,read: false },
    { title: 'Customer health alert',   body: 'ScaleUp Solutions health score dropped below 50.',           type: 'system',   createdFor: vikram._id, read: false },
    { title: 'New lead assigned',       body: 'Sanjay Dutt from MumbaiTech has been assigned to you.',      type: 'lead',     createdFor: ravi._id,   read: false },
    { title: 'Demo completed',          body: 'Product demo for MumbaiTech was completed successfully.',    type: 'activity', createdFor: ravi._id,   read: true },
    { title: 'Deal closed — lost',      body: 'ScaleUp CRM Integration deal was marked as Lost.',           type: 'deal',     createdFor: vikram._id, read: false },
    { title: 'Follow-up required',      body: 'Ritesh Deshmukh from Swasthya Health requests a follow-up call.', type: 'activity', createdFor: arjun._id,  read: false },
  ];
  await Notification.insertMany(notificationsData);

  console.log('✅ Database seeded with:');
  console.log(`   ${users.length} users`);
  console.log(`   ${leads.length} leads`);
  console.log(`   ${customers.length} customers`);
  console.log(`   ${deals.length} deals`);
  console.log(`   ${activitiesData.length} activities`);
  console.log(`   ${notificationsData.length} notifications`);
  console.log('\n📧 Login credentials:');
  console.log('   Admin:     admin@nexuscrm.com    / admin123');
  console.log('   Manager:   rahul@nexuscrm.com    / manager123');
  console.log('   Executive: sneha@nexuscrm.com    / exec123');
}

function daysFromNow(d) {
  return new Date(Date.now() + d * 86400000);
}
