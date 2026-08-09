import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';

const SEED_WORKERS = [
  {
    name: 'Mk Electricals Home Service',
    email: 'mkelectricals@gramaseva.com',
    phone: '+91 98480 12345',
    role: 'Worker',
    authProvider: 'local',
    workerProfile: {
      skill: 'electrician',
      skills: ['electrician', 'mechanic'],
      experience: 8,
      address: 'Shamshabad Village Ward 3',
      bio: '24/7 Service available. Best working skills, no delay. Works on-time with hand-over customer satisfaction.',
      location: { type: 'Point', coordinates: [78.3489, 17.2181] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.9,
      reviewCount: 3,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=600', status: 'Approved' }],
      services: [
        { name: 'Fan Repair & Fitting', price: 100 },
        { name: 'Switchboard Installation', price: 250 },
        { name: 'Inverter Wiring & Connection', price: 450 }
      ],
      gallery: [
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600'
      ],
      reviews: [
        { customerName: 'Suresh Kumar', rating: 5, comment: 'Very fast and clean ceiling fan wiring work.', date: 'May 09, 2026' },
        { customerName: 'Venkatesh P', rating: 5, comment: 'Nice explanation of inverter battery connection, reasonable charges.', date: 'Apr 07, 2026' },
        { customerName: 'Naresh Reddy', rating: 5, comment: 'Arrived at our village farm within 15 minutes for motor starter repair.', date: 'Feb 14, 2026' }
      ]
    }
  },
  {
    name: 'Satyanarayana Raju',
    email: 'satyanarayana@gramaseva.com',
    phone: '+91 98491 23456',
    role: 'Worker',
    authProvider: 'local',
    workerProfile: {
      skill: 'mason',
      skills: ['mason', 'carpenter'],
      experience: 12,
      address: 'Ammapally Temple Road',
      bio: 'Specialist in concrete slab work, brick masonry, plastering, tile laying, and wall compound construction.',
      location: { type: 'Point', coordinates: [78.3589, 17.2281] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.8,
      reviewCount: 3,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600', status: 'Approved' }],
      services: [
        { name: 'Tile Laying per sq ft', price: 25 },
        { name: 'Wall Plastering per Day', price: 700 },
        { name: 'Compound Wall Construction', price: 1500 }
      ],
      gallery: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600'
      ],
      reviews: [
        { customerName: 'Prasad Raju', rating: 5, comment: 'Excellent masonry and cement plastering work for my home extension.', date: 'May 18, 2026' },
        { customerName: 'Chandra Mohan', rating: 5, comment: 'Constructed compound wall pillars solidly with neat finishing.', date: 'Apr 22, 2026' },
        { customerName: 'Raghavendra K', rating: 4, comment: 'Punctual worker, finished tile laying on time.', date: 'Mar 10, 2026' }
      ]
    }
  },
  {
    name: 'Appa Rao Konda',
    email: 'apparao@gramaseva.com',
    phone: '+91 99892 34567',
    role: 'Worker',
    authProvider: 'local',
    workerProfile: {
      skill: 'plumber',
      skills: ['plumber', 'mechanic'],
      experience: 7,
      address: 'Panchayat Junction',
      bio: 'Borewell motor fitting, underground PVC pipe leakage fixing, tank installation, and bathroom fittings.',
      location: { type: 'Point', coordinates: [78.3429, 17.2301] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.8,
      reviewCount: 3,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600', status: 'Approved' }],
      services: [
        { name: 'Tap & Pipe Leakage Fix', price: 120 },
        { name: 'Water Tank Line Cleaning', price: 400 },
        { name: 'Overhead Tank Installation', price: 800 }
      ],
      gallery: [
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=600'
      ],
      reviews: [
        { customerName: 'Srinivasa Reddy', rating: 5, comment: 'Fixed underground PVC pipe leakage cleanly in 30 minutes.', date: 'May 02, 2026' },
        { customerName: 'Kishore V', rating: 5, comment: 'Installed 1000L overhead water tank with perfect booster pipe fittings.', date: 'Apr 11, 2026' },
        { customerName: 'Mahesh Babu', rating: 4, comment: 'Very polite and clear pricing for bathroom tap replacements.', date: 'Jan 29, 2026' }
      ]
    }
  },
  {
    name: 'Srinivas Rao M',
    email: 'srinivas.rao@gramaseva.com',
    phone: '+91 94403 45678',
    role: 'Worker',
    authProvider: 'local',
    workerProfile: {
      skill: 'carpenter',
      skills: ['carpenter'],
      experience: 10,
      address: 'Bustand Ward 5',
      bio: 'Teak wood doors, windows, roof wooden beams, modular kitchen cupboards, and furniture repair.',
      location: { type: 'Point', coordinates: [78.3389, 17.2081] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.9,
      reviewCount: 3,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600', status: 'Approved' }],
      services: [
        { name: 'Door Lock & Hinge Repair', price: 150 },
        { name: 'Modular Cupboard Installation', price: 850 },
        { name: 'Teak Wood Door Carving', price: 2200 }
      ],
      gallery: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600'
      ],
      reviews: [
        { customerName: 'Ramesh Naidu', rating: 5, comment: 'Custom teak wood door frame fitted perfectly.', date: 'May 14, 2026' },
        { customerName: 'Bhaskar Rao', rating: 5, comment: 'Repaired wooden dining table and polished nicely.', date: 'Apr 03, 2026' }
      ]
    }
  },
  {
    name: 'Venkateswarlu P',
    email: 'venkateswarlu@gramaseva.com',
    phone: '+91 98664 56789',
    role: 'Worker',
    authProvider: 'local',
    workerProfile: {
      skill: 'mechanic',
      skills: ['mechanic'],
      experience: 9,
      address: 'Market Street Shamshabad',
      bio: 'Tractor engine servicing, diesel pump repair, auto rickshaw overhaul, and generator servicing.',
      location: { type: 'Point', coordinates: [78.3489, 17.2181] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.8,
      reviewCount: 3,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600', status: 'Approved' }],
      services: [
        { name: 'Bike Engine Oil & Service', price: 250 },
        { name: 'Tractor Diesel Pump Fix', price: 900 },
        { name: 'Agricultural Sprayer Repair', price: 350 }
      ],
      gallery: [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=600'
      ],
      reviews: [
        { customerName: 'Hanumanth Rao', rating: 5, comment: 'Serviced our farm tractor engine quickly before harvesting.', date: 'May 20, 2026' },
        { customerName: 'Vijay Kumar', rating: 5, comment: 'Replaced bike clutch plate with genuine spare parts.', date: 'Mar 15, 2026' }
      ]
    }
  },
  {
    name: 'Nagendra Babu G',
    email: 'nagendra.babu@gramaseva.com',
    phone: '+91 97015 67890',
    role: 'Worker',
    authProvider: 'local',
    workerProfile: {
      skill: 'painter',
      skills: ['painter'],
      experience: 6,
      address: 'Kottur Main Road',
      bio: 'Interior whitewashing, Asian Paints exterior emulsion, waterproof wall putty, and wood varnish coating.',
      location: { type: 'Point', coordinates: [78.3600, 17.2150] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.7,
      reviewCount: 3,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600', status: 'Approved' }],
      services: [
        { name: 'Wall Putty per sq ft', price: 12 },
        { name: 'Interior Whitewashing per Day', price: 650 },
        { name: 'Asian Paints Exterior Emulsion', price: 1200 }
      ],
      gallery: [
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&q=80&w=600'
      ],
      reviews: [
        { customerName: 'Narayana Swamy', rating: 5, comment: 'Gave a fresh double-coat Asian Paints finish for our house.', date: 'May 04, 2026' },
        { customerName: 'Murali Krishna', rating: 4, comment: 'Waterproof wall putty work was neat and clean.', date: 'Feb 19, 2026' }
      ]
    }
  },
  {
    name: 'Lakshmi Devi B',
    email: 'lakshmi.devi@gramaseva.com',
    phone: '+91 98486 78901',
    role: 'Worker',
    authProvider: 'local',
    workerProfile: {
      skill: 'cleaning',
      skills: ['cleaning'],
      experience: 5,
      address: 'High School Lane',
      bio: 'Deep house sanitation, post-construction rubble clearing, festival cleaning, and water tank cleaning.',
      location: { type: 'Point', coordinates: [78.3450, 17.2200] },
      isAvailable: true,
      isVerified: true,
      averageRating: 5.0,
      reviewCount: 3,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600', status: 'Approved' }],
      services: [
        { name: 'Water Tank Deep Cleaning', price: 350 },
        { name: 'Full House Deep Cleaning', price: 900 },
        { name: 'Post Construction Debris Clearing', price: 600 }
      ],
      gallery: [
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600',
        'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&q=80&w=600'
      ],
      reviews: [
        { customerName: 'Radha Rani', rating: 5, comment: 'Cleaned overhead water tank thoroughly before festival.', date: 'Apr 28, 2026' },
        { customerName: 'Gouri Shankar', rating: 5, comment: 'Prompt and hardworking team for house deep cleaning.', date: 'Mar 12, 2026' }
      ]
    }
  }
];

export const connectDB = async () => {
  try {
    const adminSeedPassword = process.env.ADMIN_SEED_PASSWORD;
    const workerSeedPassword = process.env.WORKER_SEED_PASSWORD;

    if (!adminSeedPassword || adminSeedPassword.length < 8) {
      console.warn('[SECURITY WARNING] ADMIN_SEED_PASSWORD is not set or too short.');
    }
    if (!workerSeedPassword || workerSeedPassword.length < 8) {
      console.warn('[SECURITY WARNING] WORKER_SEED_PASSWORD is not set or too short.');
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default Admin if none exists
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      const safeAdminPassword = adminSeedPassword || 'ChangeMe!2024#Admin';
      const defaultPasswordHash = await bcrypt.hash(safeAdminPassword, 12);
      await User.create({
        name: 'Grama Seva Administrator',
        email: 'admin@gramaseva.com',
        passwordHash: defaultPasswordHash,
        role: 'Admin',
        phone: '+91 90000 00000',
        authProvider: 'local',
      });
      console.log('Seeded default Admin: admin@gramaseva.com');
    }

    // Always ensure worker galleries and reviews are populated cleanly
    const safeWorkerPassword = workerSeedPassword || 'ChangeMe!2024#Worker';
    const defaultWorkerHash = await bcrypt.hash(safeWorkerPassword, 12);

    for (const seedWorker of SEED_WORKERS) {
      const existing = await User.findOne({ email: seedWorker.email });
      if (!existing) {
        await User.create({
          ...seedWorker,
          passwordHash: defaultWorkerHash,
        });
      } else {
        // Update existing worker with curated 3 gallery photos and 2-3 reviews
        existing.workerProfile.gallery = seedWorker.workerProfile.gallery;
        existing.workerProfile.reviews = seedWorker.workerProfile.reviews;
        existing.workerProfile.services = seedWorker.workerProfile.services;
        existing.workerProfile.averageRating = seedWorker.workerProfile.averageRating;
        existing.workerProfile.reviewCount = seedWorker.workerProfile.reviews.length;
        await existing.save();
      }
    }
    console.log('Curated worker galleries & reviews updated in MongoDB.');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
