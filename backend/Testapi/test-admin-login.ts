// Load .env FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Now import other modules that depend on env
import { AuthService } from '../src/services/auth.service';

async function testAdminLogin() {
  console.log('🧪 Testing admin login...\n');

  try {
    const result = await AuthService.login({
      username: 'admin',
      password: 'admin',
    });

    console.log('✅ Login successful!\n');
    console.log('═'.repeat(50));
    console.log('Admin User Details:');
    console.log('═'.repeat(50));
    console.log('Username:', result.user.username);
    console.log('Role:', result.user.role);
    console.log('User ID:', result.user.id);
    console.log('Profile ID:', result.user.profile?.id);
    console.log('Profile Name:', result.user.profile?.name);
    console.log('\nJWT Token:', result.token);
    console.log('\n💡 Use this token to test protected endpoints:');
    console.log(`   Authorization: Bearer ${result.token}`);
    console.log('═'.repeat(50));
  } catch (error: any) {
    console.error('❌ Login failed:', error.message);
    process.exit(1);
  }
}

testAdminLogin()
  .then(() => {
    console.log('\n✨ Test completed!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });

