// Test script for credits API
const testCreditsAPI = async () => {
  try {
    console.log('Testing Credits API...');
    
    // Test credits endpoint
    const creditsResponse = await fetch('http://localhost:1001/api/credits');
    console.log('Credits API Status:', creditsResponse.status);
    
    if (creditsResponse.ok) {
      const creditsData = await creditsResponse.json();
      console.log('Credits Data:', creditsData);
    } else {
      const errorText = await creditsResponse.text();
      console.log('Credits API Error:', errorText);
    }
    
    // Test transactions endpoint
    const transactionsResponse = await fetch('http://localhost:1001/api/credits/transactions');
    console.log('Transactions API Status:', transactionsResponse.status);
    
    if (transactionsResponse.ok) {
      const transactionsData = await transactionsResponse.json();
      console.log('Transactions Data:', transactionsData);
    } else {
      const errorText = await transactionsResponse.text();
      console.log('Transactions API Error:', errorText);
    }
    
  } catch (error) {
    console.error('Test Error:', error.message);
  }
};

testCreditsAPI();