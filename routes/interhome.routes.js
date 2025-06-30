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
        // RangeFromDate: checkInDate
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

// New route for availability
router.get('/availability/:accommodationCode', async (req, res) => {
  const { accommodationCode } = req.params;
  const { checkInDate } = req.query;

  try {
    const response = await axios.get(`https://ws.interhome.com/ih/b2b/V0100/accommodation/pricelistalldur/${accommodationCode}`, {
      params: {
        SalesOffice: '0505',
        Currency: 'CHF',
        Los: true,
        RangeFromDate: checkInDate || undefined
      },
      headers: {
        'Token': 'XD1mZXqcC6',
        'PartnerId': 'CH1002557'
      }
    });

    // Get all prices from the response
    const allPrices = response.data?.priceList?.prices?.price || [];
    
    // Sort prices by check-in date
    allPrices.sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));
    
    // Filter for only 7-day duration options
    const weeklyPrices = allPrices.filter(price => price.duration === 7);
    
    if (weeklyPrices.length === 0) {
      return res.json({
        availableDates: [],
        message: "No weekly availability found"
      });
    }
    
    // Get the first available date
    const firstAvailableDate = weeklyPrices[0].checkInDate;
    
    // Get the last available date from the JSON
    const lastAvailableDate = weeklyPrices[weeklyPrices.length - 1].checkInDate;
    
    // Create a map of available dates for quick lookup
    const availableDatesMap = new Map();
    weeklyPrices.forEach(price => {
      // If multiple entries exist for same date with different paxUpTo, 
      // keep the one with lowest price
      const existingEntry = availableDatesMap.get(price.checkInDate);
      if (!existingEntry || price.price < existingEntry.price) {
        availableDatesMap.set(price.checkInDate, {
          checkInDate: price.checkInDate,
          price: price.price,
          duration: price.duration,
          paxUpTo: price.paxUpTo
        });
      }
    });
    
    // Create the availability array
    const availableDates = [];
    
    // Start with the first available date
    let currentDate = new Date(firstAvailableDate);
    const lastDate = new Date(lastAvailableDate);
    
    // Continue checking dates until we reach or exceed the last date in the JSON
    while (currentDate <= lastDate) {
      // Format the current date as YYYY-MM-DD
      const currentDateStr = currentDate.toISOString().split('T')[0];
      
      // Check if this date exists in our map
      const dateEntry = availableDatesMap.get(currentDateStr);
      if (dateEntry) {
        availableDates.push(dateEntry);
      }
      
      // Add 7 days to current date for next iteration
      currentDate.setDate(currentDate.getDate()+1);
    }
    
    // Return the availability data
    res.json({
      code: response.data?.priceList?.code,
      currency: response.data?.priceList?.currency,
      firstAvailableDate,
      lastAvailableDate,
      availableDates
    });

  } catch (error) {
    console.error('Error fetching Interhome availability:', error.message);
    res.status(500).json({ error: error.message });
  }
});



router.get("/vacancies/:code" , async (req,res) => {
  try {
    let {code} = req.params
     const response = await axios.get(`https://ws.interhome.com/ih/b2b/V0100/vacancy/${code}`, {
    
      headers: {
        'Token': 'XD1mZXqcC6',
        'PartnerId': 'CH1002557'
      }
    });
   res.status(200).json({
  message: "API successful",
  data: response.data
});

  }catch (error){
     console.error('Error fetching Interhome availability:', error.message);
    res.status(500).json({ error: error.message });
  }
})

router.get("/accommodation/all" , async (req,res) => {
  try {
     const response = await axios.get(`https://ws.interhome.com/ih/b2b/V0100/accommodation/list`, {
    
      headers: {
        'Token': 'XD1mZXqcC6',
        'PartnerId': 'CH1002557'
      }
    });
   res.status(200).json({
  message: "API successful",
  data: response.data
});

  }catch (error){
     console.error('Error fetching Interhome availability:', error.message);
    res.status(500).json({ error: error.message });
  }
})

router.get("/accommodation/detail/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`https://ws.interhome.com/ih/b2b/V0100/accommodation/${id}`, {
      headers: {
        'Token': 'XD1mZXqcC6',
        'PartnerId': 'CH1002557'
      }
    });

    console.log(`✅ Detail fetched for ID: ${id}`, response.data);

    res.status(200).json({
      message: "API successful",
      data: response.data
    });

  } catch (error) {
    console.error(`❌ Error fetching detail for ID: ${req.params.id}`, error.message);

    res.status(500).json({
      error: error.message || "Unknown error occurred"
    });
  }
});

router.post("/accommodation/price", async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.post(`https://ws.interhome.com/ih/b2b/V0100/booking/checkPrice/final`,req.body, {
      
      headers: {
        'Token': 'XD1mZXqcC6',
        'PartnerId': 'CH1002557'
      }
    });


    res.status(200).json({
      message: "API successful",
      data: response.data
    });

  } catch (error) {
    console.error(`❌ Error fetching detail for ID: ${req.params.id}`, error.message);

    res.status(500).json({
      error: error.message || "Unknown error occurred"
    });
  }
});

router.post("/booking/check", async (req, res) => {
  try {

    const response = await axios.get(`https://ws.interhome.com/ih/b2b/V0100/booking/checkPossible`, {
      params: req.body,
      headers: {
        'Token': 'XD1mZXqcC6',
        'PartnerId': 'CH1002557'
      }
    });


    res.status(200).json({
      message: "API successful",
      data: response.data
    });

  } catch (error) {
    console.error(`❌ Error fetching detail for ID: ${req.params.id}`, error.message);

    res.status(500).json({
      error: error.message || "Unknown error occurred"
    });
  }
});

module.exports = router;