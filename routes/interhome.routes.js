const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/prices/:accommodationCode', async (req, res) => {
  const { accommodationCode } = req.params;
  const { los, pax, duration, checkInDate } = req.query;

  try {
    const response = await axios.get(`https://ws.interhome.com/ih/b2b/V0100/accommodation/pricelistalldur/${accommodationCode}`, {
      params: {
        SalesOffice: '0505',
        Currency: 'CHF',
        Los: los || true,
        Pax: pax,
        Duration: duration,
        RangeFromDate: checkInDate
      },
      headers: {
        'Token': 'XD1mZXqcC6',
        'PartnerId': 'CH1002557'
      }
    });

    // Format the checkInDate to YYYY-MM-DD
    const formattedCheckInDate = checkInDate ? new Date(checkInDate + 'T00:00:00Z').toISOString().split('T')[0] : null;
    
    // Get all prices
    const allPrices = response.data?.priceList?.prices?.price || [];
    
    // Filter for weekly durations (7 days) and specific check-in date
    // Include all entries with same date and duration but different paxUpTo
    let filteredPrices = allPrices.filter(price => 
      price.duration === 7 && 
      (!formattedCheckInDate || price.checkInDate === formattedCheckInDate)
    );

    // If no prices found for the exact date, find the closest available date
    if (filteredPrices.length === 0 && formattedCheckInDate && allPrices.length > 0) {
      console.log('No prices found for exact date, finding closest date...');
      
      // Filter prices for weekly durations only (7 days)
      const weeklyPrices = allPrices.filter(price => price.duration === 7);
      
      if (weeklyPrices.length > 0) {
        // Convert requested date to timestamp for comparison
        const requestedTimestamp = new Date(formattedCheckInDate).getTime();
        
        // Find the closest date
        let closestDate = null;
        let minDifference = Infinity;
        
        // First, find the closest date
        weeklyPrices.forEach(price => {
          const priceDate = new Date(price.checkInDate).getTime();
          const difference = Math.abs(priceDate - requestedTimestamp);
          
          // Prefer future dates over past dates if they're equally distant
          if (difference < minDifference || 
              (difference === minDifference && priceDate > requestedTimestamp)) {
            minDifference = difference;
            closestDate = price.checkInDate;
          }
        });
        
        if (closestDate) {
          console.log(`Found closest date: ${closestDate}`);
          // Get ALL prices for the closest date with duration 7, including different paxUpTo values
          filteredPrices = weeklyPrices.filter(price => 
            price.checkInDate === closestDate
          );
        }
      }
    }

    // Determine which date was actually used (original or closest)
    const actualCheckInDate = filteredPrices.length > 0 ? filteredPrices[0].checkInDate : formattedCheckInDate;

    // Return the filtered data in the same structure, including the actual check-in date used
    res.json({
      priceList: {
        code: response.data?.priceList?.code,
        currency: response.data?.priceList?.currency,
        prices: {
          price: filteredPrices
        }
      },
      checkInDate: actualCheckInDate // Add the actual check-in date to the response
    });

  } catch (error) {
    console.error('Error fetching Interhome prices:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;