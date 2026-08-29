import mongoose from 'mongoose';
const { Schema, model } = mongoose;

// ─── User ───────────────────────────────────────────────────────────
const userSchema = new Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['Admin', 'Manager', 'Executive'], default: 'Executive' },
  avatar:   { type: String, default: '' },
  region:   { type: String, default: '' },
  phone:    { type: String, default: '' },
}, { timestamps: true });


// ─── Lead ───────────────────────────────────────────────────────────
const leadSchema = new Schema({
  name:       { type: String, required: true },
  title:      { type: String, default: '' },
  company:    { type: String, default: '' },
  email:      { type: String, required: true },
  phone:      { type: String, default: '' },
  source:     { type: String, enum: ['Website Organic', 'Referral', 'Cold Call', 'Webinar Sign-up', 'LinkedIn', 'Trade Show', 'Partner'], default: 'Website Organic' },
  status:     { type: String, enum: ['New', 'Contacted', 'Qualified', 'Unqualified'], default: 'New' },
  priority:   { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  notes:      { type: String, default: '' },
}, { timestamps: true });

leadSchema.index({ status: 1 });
leadSchema.index({ assignedTo: 1 });
leadSchema.index({ name: 'text', company: 'text', email: 'text' });

// ─── Customer ───────────────────────────────────────────────────────
const customerSchema = new Schema({
  name:           { type: String, required: true },
  contactPerson:  { type: String, default: '' },
  email:          { type: String, required: true },
  phone:          { type: String, default: '' },
  plan:           { type: String, enum: ['Starter', 'Professional', 'Enterprise'], default: 'Starter' },
  arr:            { type: Number, default: 0 },
  status:         { type: String, enum: ['Active', 'At Risk', 'Churned'], default: 'Active' },
  health:         { type: Number, min: 0, max: 100, default: 80 },
  originalLeadId: { type: Schema.Types.ObjectId, ref: 'Lead' },
}, { timestamps: true });

customerSchema.index({ status: 1 });

// ─── Deal ───────────────────────────────────────────────────────────
const dealSchema = new Schema({
  name:                { type: String, required: true },
  value:               { type: Number, required: true },
  stage:               { type: String, enum: ['Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'], default: 'Qualification' },
  probability:         { type: Number, min: 0, max: 100, default: 20 },
  expectedClosingDate: { type: Date },
  leadId:              { type: Schema.Types.ObjectId, ref: 'Lead' },
  customerId:          { type: Schema.Types.ObjectId, ref: 'Customer' },
  ownerId:             { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

dealSchema.index({ stage: 1 });
dealSchema.index({ ownerId: 1 });

// ─── Activity ───────────────────────────────────────────────────────
const activitySchema = new Schema({
  type:       { type: String, enum: ['Call', 'Email', 'Meeting', 'Demo', 'Note'], required: true },
  title:      { type: String, required: true },
  notes:      { type: String, default: '' },
  date:       { type: Date, default: Date.now },
  duration:   { type: Number, default: 0 },   // minutes
  status:     { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  leadId:     { type: Schema.Types.ObjectId, ref: 'Lead' },
  customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
  dealId:     { type: Schema.Types.ObjectId, ref: 'Deal' },
  createdBy:  { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

activitySchema.index({ createdBy: 1 });
activitySchema.index({ date: -1 });

// ─── Notification ───────────────────────────────────────────────────
const notificationSchema = new Schema({
  title:      { type: String, required: true },
  body:       { type: String, default: '' },
  type:       { type: String, enum: ['deal', 'lead', 'system', 'activity', 'team'], default: 'system' },
  createdFor: { type: Schema.Types.ObjectId, ref: 'User' },
  read:       { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ createdFor: 1, read: 1 });

// ─── Exports ────────────────────────────────────────────────────────
export const User         = model('User', userSchema);
export const Lead         = model('Lead', leadSchema);
export const Customer     = model('Customer', customerSchema);
export const Deal         = model('Deal', dealSchema);
export const Activity     = model('Activity', activitySchema);
export const Notification = model('Notification', notificationSchema);
