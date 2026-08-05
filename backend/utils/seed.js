/**
 * Seed script - populates the database with demo data for local development.
 * Run with: npm run seed
 */
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Worker = require('../models/Worker');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');

const KOLKATA_CENTER = { lat: 22.5726, lng: 88.3639 };

const jitter = (base, spread = 0.05) => base + (Math.random() - 0.5) * spread;

const run = async () => {
  await connectDB();
  console.log('Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Worker.deleteMany({}),
    Complaint.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('Creating admin account...');
  const admin = await User.create({
    name: 'Municipal Admin',
    email: 'admin@varuna.gov.in',
    phone: '9800000000',
    password: 'admin123',
    role: 'admin',
    address: { line1: 'KMC Head Office', ward: 'HQ', city: 'Kolkata', pincode: '700001' },
  });

  console.log('Creating demo citizens...');
  const citizens = await User.insertMany(
    [
      { name: 'Anisha Roy', email: 'anisha@example.com', phone: '9811111111', ward: 'Ward 82' },
      { name: 'Rajat Sen', email: 'rajat@example.com', phone: '9822222222', ward: 'Ward 66' },
      { name: 'Priya Das', email: 'priya@example.com', phone: '9833333333', ward: 'Ward 91' },
    ].map((c) => ({
      name: c.name,
      email: c.email,
      phone: c.phone,
      password: 'citizen123',
      role: 'citizen',
      address: { line1: `Flat, ${c.ward}`, ward: c.ward, city: 'Kolkata', pincode: '700019' },
    }))
  );

  console.log('Creating field workers...');
  const workers = await Worker.insertMany([
    { name: 'Subrata Mondal', phone: '9700000001', designation: 'Drainage Technician', ward: 'Ward 82', zone: 'South' },
    { name: 'Amit Ghosh', phone: '9700000002', designation: 'Pump Operator', ward: 'Ward 66', zone: 'Central' },
    { name: 'Debashree Pal', phone: '9700000003', designation: 'Field Supervisor', ward: 'Ward 91', zone: 'East' },
    { name: 'Kartik Das', phone: '9700000004', designation: 'Sanitation Worker', ward: 'Ward 82', zone: 'South' },
  ]);

  console.log('Creating sample complaints...');
  const categories = ['Waterlogging', 'Drain Blockage', 'Sewage Overflow', 'Broken Drain Cover'];
  const severities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['pending', 'acknowledged', 'assigned', 'in-progress', 'resolved'];

  const complaints = [];
  for (let i = 0; i < 24; i += 1) {
    const citizen = citizens[i % citizens.length];
    const status = statuses[i % statuses.length];
    const complaint = await Complaint.create({
      citizen: citizen._id,
      category: categories[i % categories.length],
      severity: severities[i % severities.length],
      description: `Reported ${categories[i % categories.length].toLowerCase()} near ${citizen.address.ward}, causing difficulty for pedestrians and vehicles.`,
      location: {
        type: 'Point',
        coordinates: [jitter(KOLKATA_CENTER.lng), jitter(KOLKATA_CENTER.lat)],
        address: `${citizen.address.ward}, Kolkata`,
        ward: citizen.address.ward,
      },
      status,
      assignedWorker: status !== 'pending' ? workers[i % workers.length]._id : null,
      assignedAt: status !== 'pending' ? new Date() : undefined,
      resolvedAt: status === 'resolved' ? new Date() : undefined,
    });
    complaints.push(complaint);
  }

  console.log('Creating notifications...');
  await Promise.all(
    complaints.slice(0, 10).map((c) =>
      Notification.create({
        user: c.citizen,
        title: `Complaint ${c.complaintCode} update`,
        message: `Your complaint is currently marked as "${c.status}".`,
        type: 'status-update',
        relatedComplaint: c._id,
      })
    )
  );

  console.log('\nSeed complete!');
  console.log('----------------------------------------');
  console.log('Admin login:    admin@varuna.gov.in / admin123');
  console.log('Citizen login:  anisha@example.com / citizen123');
  console.log('----------------------------------------');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
