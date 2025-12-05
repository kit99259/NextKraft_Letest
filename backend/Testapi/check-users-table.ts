import { supabase } from '../src/config/supabase';

async function checkUsersTable() {
  console.log('🔍 Checking users table structure...\n');

  try {
    // Try to get table info by querying with different role values
    const testRoles = ['ADMIN', 'admin', 'OPERATOR', 'operator', 'CUSTOMER', 'customer'];
    
    for (const role of testRoles) {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('role', role)
        .limit(1);
      
      if (!error) {
        console.log(`✅ Role "${role}" is valid`);
      } else {
        console.log(`❌ Role "${role}" - ${error.message}`);
      }
    }

    // Try to see what the actual constraint expects
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .limit(1);

    if (data && data.length > 0) {
      console.log('\n📋 Sample role from database:', data[0].role);
    }

    // Try inserting with lowercase
    console.log('\n🧪 Testing insert with lowercase role...');
    const { error: insertError } = await supabase
      .from('users')
      .insert([{
        username: 'test_check_' + Date.now(),
        password_hash: 'test',
        role: 'admin'
      }]);

    if (insertError) {
      console.log('❌ Lowercase failed:', insertError.message);
    } else {
      console.log('✅ Lowercase works!');
      // Clean up
      await supabase.from('users').delete().eq('username', 'test_check_' + Date.now());
    }

  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

checkUsersTable()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });

