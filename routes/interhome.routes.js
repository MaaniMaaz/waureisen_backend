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
    console.log('Original checkInDate:', checkInDate);
    console.log('Formatted date:', formattedCheckInDate);

    // Filter the price data for weekly durations and specific check-in date
    const filteredPrices = response.data?.priceList?.prices?.price?.filter(price => 
      [7, 14, 21, 28].includes(price.duration) && 
      (!formattedCheckInDate || price.checkInDate === formattedCheckInDate)
    ) || [];

    // Return the filtered data in the same structure
    res.json({
      priceList: {
        code: response.data?.priceList?.code,
        currency: response.data?.priceList?.currency,
        prices: {
          price: filteredPrices
        }
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;