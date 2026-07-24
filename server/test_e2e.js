import { MongoMemoryServer } from 'mongodb-memory-server';
import { spawn } from 'child_process';
import axios from 'axios';
import { setTimeout } from 'timers/promises';

const PORT = 3055;
const API_URL = `http://localhost:${PORT}`;

const api = axios.create({ baseURL: API_URL });

async function waitForServer() {
  for (let i = 0; i < 30; i++) {
    try {
      await axios.get(API_URL);
      return true;
    } catch (e) {
      await setTimeout(500);
    }
  }
  throw new Error('Server did not start in time');
}

async function runTests() {
  console.log('1. Starting MongoMemoryServer...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  console.log('2. Starting Backend Server...');
  const serverProcess = spawn('node', ['index.js'], {
    env: {
      ...process.env,
      PORT,
      MONGODB_URI: uri,
      JWT_SECRET: 'test_super_secret',
    },
    stdio: 'pipe',
  });

  serverProcess.stdout.on('data', (d) => console.log(`[Server]: ${d.toString().trim()}`));
  serverProcess.stderr.on('data', (d) => console.error(`[Server ERR]: ${d.toString().trim()}`));

  let passed = false;

  try {
    await waitForServer();
    console.log('Server is ready. Running E2E flows...\n');

    // --- 1. Customer Registration ---
    console.log('--- Registering Customer ---');
    const { data: customerRes } = await api.post('/api/auth/register', {
      name: 'Test Customer',
      email: 'customer@test.com',
      password: 'password123',
      role: 'Customer',
      phone: '1234567890'
    });
    const customerToken = customerRes.token;
    const customerId = customerRes.user._id || customerRes.user.id;
    console.log(`✅ Customer registered with ID: ${customerId}`);

    // --- 2. Worker Registration ---
    console.log('\n--- Registering Worker ---');
    const { data: workerRes } = await api.post('/api/auth/register', {
      name: 'Test Worker',
      email: 'worker@test.com',
      password: 'password123',
      role: 'Worker',
      phone: '0987654321',
      workerProfile: {
        skill: 'electrician',
        experience: 5,
        address: 'Test Village',
        location: { type: 'Point', coordinates: [78.34, 17.21] },
        serviceRadius: 15
      }
    });
    const workerToken = workerRes.token;
    const workerId = workerRes.user._id || workerRes.user.id;
    console.log(`✅ Worker registered with ID: ${workerId}`);

    // --- 3. Admin Login ---
    console.log('\n--- Admin Login ---');
    const { data: adminRes } = await api.post('/api/auth/login', {
      email: 'admin@gramaseva.com',
      password: 'admin123'
    });
    const adminToken = adminRes.token;
    console.log('✅ Admin logged in');

    // --- 4. Admin Verifies Worker ---
    console.log('\n--- Admin Verifying Worker ---');
    const { data: verifiedWorker } = await api.patch(`/api/users/${workerId}/verify`, {
      status: 'Approved'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (!verifiedWorker.workerProfile.isVerified) throw new Error('Worker was not verified!');
    console.log('✅ Worker verified successfully');

    // --- 5. Customer Creates Booking ---
    console.log('\n--- Customer Creates Booking ---');
    const { data: booking } = await api.post('/api/bookings', {
      serviceCategory: 'electrician',
      description: 'Fix the fan',
      coordinates: [78.34, 17.21],
      address: 'Test House'
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    const bookingId = booking._id || booking.id;
    console.log(`✅ Booking created with ID: ${bookingId}`);

    // --- 6. Worker Accepts Booking ---
    console.log('\n--- Worker Accepts Booking ---');
    const { data: acceptedBooking } = await api.patch(`/api/bookings/${bookingId}/accept`, {}, {
      headers: { Authorization: `Bearer ${workerToken}` }
    });
    if (acceptedBooking.status !== 'Accepted') throw new Error('Booking status is not Accepted');
    console.log('✅ Booking accepted');

    // --- 7. Worker Starts Booking ---
    console.log('\n--- Worker Starts Booking ---');
    const { data: startedBooking } = await api.patch(`/api/bookings/${bookingId}/start`, {}, {
      headers: { Authorization: `Bearer ${workerToken}` }
    });
    if (startedBooking.status !== 'In Progress') throw new Error('Booking status is not In Progress');
    console.log('✅ Booking started');

    // --- 8. Worker Completes Booking ---
    console.log('\n--- Worker Completes Booking ---');
    const { data: completedBooking } = await api.patch(`/api/bookings/${bookingId}/complete`, {}, {
      headers: { Authorization: `Bearer ${workerToken}` }
    });
    if (completedBooking.status !== 'Completed') throw new Error('Booking status is not Completed');
    console.log('✅ Booking completed');

    // --- 9. Customer Submits Review ---
    console.log('\n--- Customer Submits Review ---');
    const { data: review } = await api.post('/api/reviews', {
      bookingId,
      rating: 5,
      comment: 'Great job!'
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log(`✅ Review created with Rating: ${review.rating}`);

    console.log('\n🚀 ALL TESTS PASSED SUCCESSFULLY! The backend is 100% solid.');
    passed = true;

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.response?.data || error.message);
  } finally {
    serverProcess.kill();
    await mongod.stop();
    process.exit(passed ? 0 : 1);
  }
}

runTests();
