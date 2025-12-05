import { supabase } from '../src/config/supabase';

async function testLowercase() {
  console.log('🧪 Testing with lowercase roles...\n');

  const roles = ['admin', 'operator', 'customer'];

  for (const role of roles) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: `test_${role}_${Date.now()}`,
          password_hash: 'test_hash',
          role: role
        }])
        .select()
        .single();

      if (error) {
        console.log(`❌ "${role}" failed:`, error.message);
      } else {
        console.log(`✅ "${role}" succeeded!`);
        console.log('   User ID:', data.id);
        // Clean up
        await supabase.from('users').delete().eq('id', data.id);
      }
    } catch (err: any) {
      console.log(`❌ "${role}" exception:`, err.message);
    }
  }
}

testLowercase()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });

