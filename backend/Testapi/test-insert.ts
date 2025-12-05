import { supabase } from '../src/config/supabase';
import { UserRole } from '../src/constants/roles';

async function testInsert() {
  console.log('🧪 Testing user insert...\n');
  console.log('UserRole.ADMIN value:', UserRole.ADMIN);
  console.log('Type:', typeof UserRole.ADMIN);
  console.log('String value:', String(UserRole.ADMIN));
  console.log('');

  // Try with enum value directly
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        username: 'test_admin_' + Date.now(),
        password_hash: 'test_hash',
        role: UserRole.ADMIN
      }])
      .select()
      .single();

    if (error) {
      console.log('❌ Insert with enum failed:', error.message);
      console.log('Error code:', error.code);
      console.log('Error details:', error);
    } else {
      console.log('✅ Insert with enum succeeded!');
      console.log('Created user:', data);
      // Clean up
      await supabase.from('users').delete().eq('id', data.id);
    }
  } catch (err: any) {
    console.log('❌ Exception:', err.message);
  }

  // Try with string value
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        username: 'test_admin2_' + Date.now(),
        password_hash: 'test_hash',
        role: 'ADMIN'
      }])
      .select()
      .single();

    if (error) {
      console.log('\n❌ Insert with string "ADMIN" failed:', error.message);
    } else {
      console.log('\n✅ Insert with string "ADMIN" succeeded!');
      console.log('Created user:', data);
      // Clean up
      await supabase.from('users').delete().eq('id', data.id);
    }
  } catch (err: any) {
    console.log('\n❌ Exception:', err.message);
  }
}

testInsert()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });

