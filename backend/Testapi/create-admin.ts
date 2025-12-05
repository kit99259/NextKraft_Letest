// Load .env FIRST before any other imports
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Now import other modules that depend on env
import { AuthService } from '../src/services/auth.service';
import { UserRole } from '../src/constants/roles';
import { logger } from '../src/config/logger';

async function createAdminUser() {
  console.log('🔧 Creating admin user...\n');

  try {
    const adminData = {
      username: 'admin',
      password: 'admin',
      role: UserRole.ADMIN,
      full_name: 'System Administrator',
    };

    const result = await AuthService.signup(adminData);

    console.log('✅ Admin user created successfully!\n');
    console.log('═'.repeat(50));
    console.log('Admin User Details:');
    console.log('═'.repeat(50));
    console.log('Username:', result.user.username);
    console.log('Role:', result.user.role);
    console.log('User ID:', result.user.id);
    console.log('Profile ID:', result.user.profile?.id);
    console.log('\nJWT Token:', result.token);
    console.log('\n💡 Save this token for testing protected endpoints');
    console.log('═'.repeat(50));

    logger.info('Admin user created', {
      username: result.user.username,
      userId: result.user.id,
    });
  } catch (error: any) {
    if (error.message === 'Username already exists') {
      console.log('⚠️  Admin user already exists!\n');
      console.log('If you want to reset the password, delete the user first.');
    } else {
      console.error('❌ Error creating admin user:', error.message);
      logger.error('Failed to create admin user', { error: error.message });
    }
    process.exit(1);
  }
}

createAdminUser()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Fatal error:', err);
    process.exit(1);
  });

