const { MongoClient } = require('mongodb');

const testConnections = async () => {
  const password = 'dinkart';
  const user = 'dinkart';
  const cluster = 'cluster0.psjhjvx.mongodb.net';

  // Test 1: SRV connection (current)
  const srvUri = `mongodb+srv://${user}:${password}@${cluster}/collabboard?retryWrites=true&w=majority`;

  // Test 2: Direct connection (bypasses DNS)
  const directUri = `mongodb://${user}:${password}@ac-xyz123-shard-00-00.psjhjvx.mongodb.net:27017,ac-xyz123-shard-00-01.psjhjvx.mongodb.net:27017,ac-xyz123-shard-00-02.psjhjvx.mongodb.net:27017/collabboard?ssl=true&replicaSet=atlas-xyz123-shard-0&authSource=admin&retryWrites=true&w=majority`;

  console.log('Testing MongoDB Atlas connections...\n');

  // Test SRV
  console.log('Test 1: SRV connection string');
  console.log('URL:', srvUri.replace(password, '****'));
  try {
    const client = new MongoClient(srvUri, { serverSelectionTimeoutMS: 10000 });
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('SUCCESS: SRV connection works!\n');
    await client.close();
    return;
  } catch (err) {
    console.log('FAILED:', err.message, '\n');
  }

  // Test direct (needs actual shard names - will likely fail)
  console.log('Test 2: Direct connection string');
  console.log('Note: Direct URL needs actual shard hostnames from Atlas.\n');

  console.log('---');
  console.log('Likely causes:');
  console.log('1. Free tier cluster is PAUSED. Go to Atlas → Clusters → click Resume.');
  console.log('2. Wrong password. Check Atlas → Database Access → reset password.');
  console.log('3. Network/VPN blocking outbound MongoDB port 27017.');
  console.log('4. Your IP whitelist was not saved correctly. Try adding your exact IP from https://whatismyipaddress.com');
};

testConnections();
