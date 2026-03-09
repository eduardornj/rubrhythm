// Test script to simulate frontend credits API calls
const testCreditsFromFrontend = async () => {
  try {
    console.log('Testing Credits API from frontend perspective...');
    
    // First, let's check if we can access the login page
    const loginResponse = await fetch('http://localhost:1001/auth/signin');
    console.log('Login page status:', loginResponse.status);
    
    // Test the credits API without authentication (should get 401)
    const creditsResponse = await fetch('http://localhost:1001/api/credits');
    console.log('Credits API Status (no auth):', creditsResponse.status);
    
    if (!creditsResponse.ok) {
      const errorData = await creditsResponse.json();
      console.log('Credits API Error:', errorData);
    }
    
    // Test transactions API without authentication (should get 401)
    const transactionsResponse = await fetch('http://localhost:1001/api/credits/transactions');
    console.log('Transactions API Status (no auth):', transactionsResponse.status);
    
    if (!transactionsResponse.ok) {
      const errorData = await transactionsResponse.json();
      console.log('Transactions API Error:', errorData);
    }
    
    console.log('\nNote: 401 errors are expected without authentication.');
    console.log('The issue might be that the frontend is not properly authenticated.');
    console.log('Check if the user is logged in and session is valid.');
    
  } catch (error) {
    console.error('Test Error:', error.message);
  }
};

testCreditsFromFrontend();