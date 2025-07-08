const Filter = require("../models/filter.model");
const Listing = require("../models/listing.model");


 const AddListingWithFilter = async (req, res) => {

    try {
        console.log('Creating listing with filters...');
        
        // Step 1: Extract filter data from listing data
        const { filterData, ...actualListingData } = req?.body;
        
        // Step 2: Create the listing first (without filter reference)
        console.log('Creating listing document...');
        const listing = new Listing({...actualListingData, owner:req.user.id,ownerType:req.user.role  == "provider"? "Provider":"Admin" });
        const savedListing = await listing.save();
        console.log('Listing created with ID:', savedListing._id);
        
        // Step 3: If filter data exists, create the filter document
        if (savedListing && filterData) {
          console.log('Creating filter document for listing...');
          
          // Prepare filter document
          const filterDocument = {
            ...filterData,
            listing: savedListing._id,    // Link to the listing
            isTemplate: false,            // This is NOT a template
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          console.log('Filter document to be saved:', JSON.stringify(filterDocument, null, 2));
          
          // Step 4: Save the filter document
          const filter = new Filter(filterDocument);
          const savedFilter = await filter.save();
          console.log('Filter created with ID:', savedFilter._id);
          
          // Step 5: Update the listing with the filter reference
          console.log('Linking filter to listing...');
          savedListing.filters = savedFilter._id;
          await savedListing.save();
          
          console.log('Successfully created listing with filter:', {
            listingId: savedListing._id,
            filterId: savedFilter._id
          });

           res.status(200).json({ success: true, savedListing });
        } else {
          console.log('No filter data provided, listing created without filters');
        }
        
        return savedListing;
      } catch (error) {
        console.error('Error creating listing with filters:', error);
         res.status(500).json({ success: false, error: error.message });
  
      }
}

const EditListingWithFilter = async (req,res) => {
    try {
    const {listingId} = req.params
    
    const { filterData, ...actualListingData } = req?.body;
    
    // Step 1: Update the listing
    const updatedListing = await Listing.findOneAndUpdate(
      {_id:listingId},
      actualListingData,
      { new: true }
    );
    
    if (!updatedListing) {
      throw new Error('Listing not found');
    }
    
    // Step 2: Handle filter data
    if (filterData) {
      if (updatedListing.filters) {
        // Update existing filter
        console.log('Updating existing filter:', updatedListing.filters);
        await Filter.findByIdAndUpdate(
          updatedListing.filters,
          {
            ...filterData,
            // listing: listingId,
            isTemplate: false,
            updatedAt: new Date()
          }
        );
      } else {
        // Create new filter for existing listing
        console.log('Creating new filter for existing listing');
        const filterDocument = {
          ...filterData,
          listing: listingId,
          isTemplate: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const filter = new Filter(filterDocument);
        const savedFilter = await filter.save();
        
        // Link filter to listing
        updatedListing.filters = savedFilter._id;
        await updatedListing.save();
        
        console.log('New filter created and linked:', savedFilter._id);
      }
    }
    
    res.status(200).json({ success: true, updatedListing });
   
  } catch (error) {
    console.error('Error updating listing with filters:', error);
     res.status(500).json({ success: false, error: error.message });
  
  }

}

const GetFilterOfListingById = async (req,res) => {
 try{
    const {id} = req.params
    const filter = await Filter.findById(id)

 res.status(200).json({ success: true, filter });
       
 }  catch(error){
     console.error('Error in getting filter by id:', error);
         res.status(500).json({ success: false, error: error.message });
 } 
}



module.exports = {
  AddListingWithFilter,
  GetFilterOfListingById,
  EditListingWithFilter
};