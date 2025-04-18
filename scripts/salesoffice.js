// 1. Put your big JSON into a variable (or require it from a file)
const data = {
    "salesOffice": [
      {
        "salesOfficeCode": "0505",
        "name": "Interhome",
        // ... rest of the first office data ...
      },
      // ... other offices ...
    ]
  };
  
  // 2. Extract just the codes
  const salesOfficeCodes = data.salesOffice.map(o => o.salesOfficeCode);
  
  // 3. API config
  const API_BASE = 'https://ws.interhome.com/ih/b2b/V0100/accommodation/pricelistalldur';
  const TOKEN = 'XD1mZXqcC6';
  const PARTNER = 'CH1002557';
  
  const fetch = require('node-fetch');  // npm install node-fetch@2
  
  // Helper to fetch one code
  async function fetchFor(code, accommodationCode) {
    const url = `${API_BASE}/${accommodationCode}?SalesOffice=${encodeURIComponent(code)}&Los=true`;
    const res = await fetch(url, {
      headers: {
        'Token': TOKEN,
        'PartnerId': PARTNER,
        'SalesOffice': code,
        'Accept': 'application/json'
      }
    });
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    return await res.json();
  }
  
  // Main execution
  (async () => {
    const results = [];
    const fs = require('fs');
    const path = require('path');

    for (const code of salesOfficeCodes) {
      try {
        const accommodationCode = 'NL1600.100.1';
        const json = await fetchFor(code, accommodationCode);
        results.push({ 
          salesOffice: code, 
          result: json 
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (err) {
        console.error(`Error for sales office ${code}:`, err.message);
        results.push({ 
          salesOffice: code, 
          error: err.message 
        });
      }
    }

    // Save results to a file
    const outputPath = path.join(__dirname, 'salesoffice_results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`Results saved to: ${outputPath}`);
    
    // Also log to console
    console.log(JSON.stringify(results, null, 2));
  })();