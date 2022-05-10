import contentful from 'contentful';
import algoliasearch from "algoliasearch/lite.js";
import dotenv from 'dotenv';

//https://www.algolia.com/doc/api-reference/api-methods/partial-update-objects/
(async function () {
  dotenv.config();
  
  const client = contentful.createClient({
    space: process.env.CONTENTFUL_SPACE_ID,
    environment: process.env.CONTENTFUL_ENV,
    accessToken: process.env.CONTENTFUL_CONTENT_DELIVERY_API_TOKEN,
  })  

  try {
    const entries = await client.getEntries({ skip: 0, limit: 1000 })
    let testEnty = entries.items[0];
    testEnty.objectID = testEnty.sys.id;

    if (entries.items.length > 0) {
      const client = algoliasearch(
        process.env.PUBLIC_ALGOLIA_APP_ID,
        process.env.PUBLIC_ALGOLIA_SEARCH_ONLY_API_KEY,
      );

      const index = client.initIndex(process.env.PUBLIC_ALGOLIA_APP_INDEX);

      entries.items.forEach(async (entry) => {
        entry.objectID = entry.sys.id;
        try {
          const algoliaResponse = await index.partialUpdateObject(entry, 
            { 
              createIfNotExists: true, 
            }
            );
            
            console.log('Successfully added ' + algoliaResponse);     
        } catch (error) {
          console.log(error); 
        }
      })
    }
  } catch (error) {
    console.log(error);
  }
})();
