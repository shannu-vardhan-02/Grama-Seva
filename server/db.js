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
      averageRating: 5.0,
      reviewCount: 4,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400', status: 'Approved' }],
      services: [
        { name: 'Fan Repair & Fitting', price: 100 },
        { name: 'Switchboard Installation', price: 250 },
        { name: 'Inverter Wiring & Connection', price: 450 }
      ],
      gallery: [
        'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
        'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400'
      ],
      reviews: [
        { customerName: 'Suresh Kumar', rating: 5, comment: 'Very good technician', date: 'May 09, 2026' },
        { customerName: 'Venkatesh P', rating: 5, comment: 'Nice explanation, reasonable prices. Keep in touch!', date: 'Apr 07, 2026' }
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
      experience: 12,
      address: 'Ammapally Temple Road',
      bio: 'Specialist in concrete slab work, brick masonry, plastering, tile laying, and wall compound construction.',
      location: { type: 'Point', coordinates: [78.3589, 17.2281] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.8,
      reviewCount: 34,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400', status: 'Approved' }]
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
      experience: 7,
      address: 'Panchayat Junction',
      bio: 'Borewell motor fitting, underground PVC pipe leakage fixing, tank installation, and bathroom fittings.',
      location: { type: 'Point', coordinates: [78.3429, 17.2301] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.7,
      reviewCount: 19,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400', status: 'Approved' }]
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
      experience: 10,
      address: 'Bustand Ward 5',
      bio: 'Teak wood doors, windows, roof wooden beams, modular kitchen cupboards, and furniture repair.',
      location: { type: 'Point', coordinates: [78.3389, 17.2081] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.9,
      reviewCount: 42,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400', status: 'Approved' }]
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
      experience: 9,
      address: 'Market Street Shamshabad',
      bio: 'Tractor engine servicing, diesel pump repair, auto rickshaw overhaul, and generator servicing.',
      location: { type: 'Point', coordinates: [78.3489, 17.2181] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.8,
      reviewCount: 25,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400', status: 'Approved' }]
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
      experience: 6,
      address: 'Kottur Main Road',
      bio: 'Interior whitewashing, Asian Paints exterior emulsion, waterproof wall putty, and wood varnish coating.',
      location: { type: 'Point', coordinates: [78.3600, 17.2150] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.6,
      reviewCount: 15,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400', status: 'Approved' }]
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
      experience: 5,
      address: 'High School Lane',
      bio: 'Deep house sanitation, post-construction rubble clearing, festival cleaning, and water tank cleaning.',
      location: { type: 'Point', coordinates: [78.3450, 17.2200] },
      isAvailable: true,
      isVerified: true,
      averageRating: 5.0,
      reviewCount: 31,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', status: 'Approved' }]
    }
  },
  {
    name: 'Koteswara Rao Ch',
    email: 'koteswara.rao@gramaseva.com',
    phone: '+91 98497 89012',
    role: 'Worker',
    authProvider: 'local',
    workerProfile: {
      skill: 'electrician',
      experience: 15,
      address: 'Grama Panchayat Road',
      bio: 'Senior electrician. Submersible pump control box fixing, inverter wiring, and commercial line setup.',
      location: { type: 'Point', coordinates: [78.3490, 17.2190] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.9,
      reviewCount: 53,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400', status: 'Approved' }]
    }
  },
  {
    name: 'Subba Rao Yerram',
    email: 'subbarao@gramaseva.com',
    phone: '+91 99898 90123',
    role: 'Worker',
    authProvider: 'local',
    workerProfile: {
      skill: 'plumber',
      experience: 11,
      address: 'Rallaguda Village',
      bio: 'Overhead tank piping, solar water heater installation, drainage unclogging, and tap replacement.',
      location: { type: 'Point', coordinates: [78.3550, 17.2250] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.7,
      reviewCount: 22,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', status: 'Approved' }]
    }
  },
  {
    name: 'Prasad Kumar V',
    email: 'prasad.kumar@gramaseva.com',
    phone: '+91 94409 01234',
    role: 'Worker',
    authProvider: 'local',
    workerProfile: {
      skill: 'mason',
      experience: 14,
      address: 'Pedda Golconda',
      bio: 'Building contractor assistant, slab casting, cement plastering, and granite stone fitting.',
      location: { type: 'Point', coordinates: [78.3620, 17.2100] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.8,
      reviewCount: 39,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400', status: 'Approved' }]
    }
  },
  {
    name: 'Brahmaiah Naidu',
    email: 'brahmaiah@gramaseva.com',
    phone: '+91 98660 12345',
    role: 'Worker',
    authProvider: 'local',
    workerProfile: {
      skill: 'carpenter',
      experience: 13,
      address: 'Shamshabad East',
      bio: 'Custom wooden cots, dining tables, main door carving, and roof truss wood installation.',
      location: { type: 'Point', coordinates: [78.3510, 17.2220] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.9,
      reviewCount: 47,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400', status: 'Approved' }]
    }
  },
  {
    name: 'Anjaneyulu T',
    email: 'anjaneyulu@gramaseva.com',
    phone: '+91 97011 23456',
    role: 'Worker',
    authProvider: 'local',
    workerProfile: {
      skill: 'mechanic',
      experience: 8,
      address: 'Airport Colony Junction',
      bio: 'Two-wheeler bike servicing, oil change, agricultural sprayer pump repair, and clutch plate replacement.',
      location: { type: 'Point', coordinates: [78.3410, 17.2140] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.6,
      reviewCount: 18,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400', status: 'Approved' }]
    }
  },
  {
    name: 'Nageswara Rao P',
    email: 'nageswara.rao@gramaseva.com',
    phone: '+91 98482 34567',
    role: 'Worker',
    authProvider: 'local',
    workerProfile: {
      skill: 'other',
      experience: 6,
      address: 'Tondupally Village',
      bio: 'Heavy lifting, agricultural harvest help, garden clearing, and wall demolition assistance.',
      location: { type: 'Point', coordinates: [78.3460, 17.2090] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.8,
      reviewCount: 29,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=400', status: 'Approved' }]
    }
  },
  {
    name: 'Veeraiah Swamy',
    email: 'veeraiah@gramaseva.com',
    phone: '+91 98493 45678',
    role: 'Worker',
    authProvider: 'local',
    workerProfile: {
      skill: 'electrician',
      experience: 9,
      address: 'Gaganpahad',
      bio: 'LED light setup, ceiling fan installation, main meter board shift, and short circuit fixing.',
      location: { type: 'Point', coordinates: [78.3530, 17.2290] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.7,
      reviewCount: 33,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400', status: 'Approved' }]
    }
  },
  {
    name: 'Ramana Reddy',
    email: 'ramana.reddy@gramaseva.com',
    phone: '+91 99894 56789',
    role: 'Worker',
    authProvider: 'local',
    workerProfile: {
      skill: 'mason',
      experience: 10,
      address: 'Mamidipally',
      bio: 'Waterproofing masonry, compound wall stone work, compound gate pillar construction.',
      location: { type: 'Point', coordinates: [78.3570, 17.2180] },
      isAvailable: true,
      isVerified: true,
      averageRating: 4.9,
      reviewCount: 36,
      proofOfWork: [{ url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400', status: 'Approved' }]
    }
  }
];

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default Admin if none exists
    const adminExists = await User.findOne({ role: 'Admin' });
    if (!adminExists) {
      const defaultPasswordHash = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Grama Seva Administrator',
        email: 'admin@gramaseva.com',
        passwordHash: defaultPasswordHash,
        role: 'Admin',
        phone: '+91 90000 00000',
        authProvider: 'local',
      });
      console.log('Seeded default Admin: admin@gramaseva.com / admin123');
    }

    // Seed workers if count is low
    const workerCount = await User.countDocuments({ role: 'Worker' });
    if (workerCount < 5) {
      console.log('Seeding initial Andhra village workers...');
      const defaultWorkerHash = await bcrypt.hash('worker123', 10);
      const docsToInsert = SEED_WORKERS.map(w => ({
        ...w,
        passwordHash: defaultWorkerHash
      }));
      await User.insertMany(docsToInsert);
      console.log(`Successfully seeded ${SEED_WORKERS.length} Andhra village workers.`);
    }
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

