export async function GET(request, { params }) {
    const { state } = params;
  
    const locations = [
      { state: "Alabama", cities: [{ name: "Birmingham" }, { name: "Huntsville" }, { name: "Mobile" }, { name: "Montgomery" }, { name: "Tuscaloosa" }] },
      { state: "Alaska", cities: [{ name: "Anchorage" }, { name: "Fairbanks" }, { name: "Juneau" }] },
      { state: "Arizona", cities: [{ name: "Chandler" }, { name: "Gilbert" }, { name: "Glendale" }, { name: "Mesa" }, { name: "Peoria" }, { name: "Phoenix" }, { name: "Scottsdale" }, { name: "Tempe" }, { name: "Tucson" }, { name: "Yuma" }] },
      { state: "Arkansas", cities: [{ name: "Fayetteville" }, { name: "Fort Smith" }, { name: "Jonesboro" }, { name: "Little Rock" }, { name: "Springdale" }] },
      { state: "California", cities: [{ name: "Anaheim" }, { name: "Bakersfield" }, { name: "Chula Vista" }, { name: "Corona" }, { name: "Costa Mesa" }, { name: "Elk Grove" }, { name: "Escondido" }, { name: "Fontana" }, { name: "Fremont" }, { name: "Fresno" }, { name: "Fullerton" }, { name: "Garden Grove" }, { name: "Glendale" }, { name: "Hayward" }, { name: "Huntington Beach" }, { name: "Irvine" }, { name: "Lancaster" }, { name: "Long Beach" }, { name: "Los Angeles" }, { name: "Modesto" }, { name: "Moreno Valley" }, { name: "Oakland" }, { name: "Oceanside" }, { name: "Ontario" }, { name: "Orange" }, { name: "Oxnard" }, { name: "Palmdale" }, { name: "Pasadena" }, { name: "Pomona" }, { name: "Rancho Cucamonga" }, { name: "Riverside" }, { name: "Roseville" }, { name: "Sacramento" }, { name: "Salinas" }, { name: "San Bernardino" }, { name: "San Diego" }, { name: "San Francisco" }, { name: "San Jose" }, { name: "Santa Ana" }, { name: "Santa Clara" }, { name: "Santa Clarita" }, { name: "Santa Rosa" }, { name: "Simi Valley" }, { name: "Stockton" }, { name: "Sunnyvale" }, { name: "Thousand Oaks" }, { name: "Torrance" }, { name: "Vallejo" }, { name: "Ventura" }, { name: "Victorville" }, { name: "Visalia" }, { name: "West Covina" }] },
      { state: "Colorado", cities: [{ name: "Arvada" }, { name: "Aurora" }, { name: "Boulder" }, { name: "Centennial" }, { name: "Colorado Springs" }, { name: "Denver" }, { name: "Fort Collins" }, { name: "Lakewood" }, { name: "Pueblo" }, { name: "Thornton" }, { name: "Westminster" }] },
      { state: "Connecticut", cities: [{ name: "Bridgeport" }, { name: "Danbury" }, { name: "Hartford" }, { name: "New Haven" }, { name: "Norwalk" }, { name: "Stamford" }, { name: "Waterbury" }] },
      { state: "Delaware", cities: [{ name: "Dover" }, { name: "Newark" }, { name: "Wilmington" }] },
      { state: "Florida", cities: [{ name: "Cape Coral" }, { name: "Clearwater" }, { name: "Coral Springs" }, { name: "Davie" }, { name: "Fort Lauderdale" }, { name: "Fort Myers" }, { name: "Gainesville" }, { name: "Hialeah" }, { name: "Hollywood" }, { name: "Jacksonville" }, { name: "Lakeland" }, { name: "Miami" }, { name: "Miami Gardens" }, { name: "Miramar" }, { name: "Ocala" }, { name: "Orlando" }, { name: "Palm Bay" }, { name: "Panama City" }, { name: "Pembroke Pines" }, { name: "Pensacola" }, { name: "Pompano Beach" }, { name: "Port St. Lucie" }, { name: "St. Petersburg" }, { name: "Tallahassee" }, { name: "Tampa" }, { name: "West Palm Beach" }] },
      { state: "Georgia", cities: [{ name: "Albany" }, { name: "Athens" }, { name: "Atlanta" }, { name: "Augusta" }, { name: "Columbus" }, { name: "Macon" }, { name: "Marietta" }, { name: "Roswell" }, { name: "Sandy Springs" }, { name: "Savannah" }] },
      { state: "Hawaii", cities: [{ name: "Honolulu" }] },
      { state: "Idaho", cities: [{ name: "Boise" }, { name: "Idaho Falls" }, { name: "Meridian" }, { name: "Nampa" }] },
      { state: "Illinois", cities: [{ name: "Aurora" }, { name: "Champaign" }, { name: "Chicago" }, { name: "Elgin" }, { name: "Joliet" }, { name: "Naperville" }, { name: "Peoria" }, { name: "Rockford" }, { name: "Springfield" }, { name: "Waukegan" }] },
      { state: "Indiana", cities: [{ name: "Bloomington" }, { name: "Carmel" }, { name: "Evansville" }, { name: "Fort Wayne" }, { name: "Hammond" }, { name: "Indianapolis" }, { name: "Lafayette" }, { name: "South Bend" }] },
      { state: "Iowa", cities: [{ name: "Cedar Rapids" }, { name: "Davenport" }, { name: "Des Moines" }, { name: "Sioux City" }, { name: "Waterloo" }] },
      { state: "Kansas", cities: [{ name: "Kansas City" }, { name: "Lawrence" }, { name: "Olathe" }, { name: "Overland Park" }, { name: "Topeka" }, { name: "Wichita" }] },
      { state: "Kentucky", cities: [{ name: "Bowling Green" }, { name: "Lexington" }, { name: "Louisville" }, { name: "Owensboro" }] },
      { state: "Louisiana", cities: [{ name: "Baton Rouge" }, { name: "Kenner" }, { name: "Lafayette" }, { name: "Lake Charles" }, { name: "Monroe" }, { name: "New Orleans" }, { name: "Shreveport" }] },
      { state: "Maine", cities: [{ name: "Portland" }] },
      { state: "Maryland", cities: [{ name: "Baltimore" }, { name: "Columbia" }, { name: "Germantown" }, { name: "Silver Spring" }] },
      { state: "Massachusetts", cities: [{ name: "Boston" }, { name: "Brockton" }, { name: "Cambridge" }, { name: "Fall River" }, { name: "Lowell" }, { name: "Lynn" }, { name: "New Bedford" }, { name: "Quincy" }, { name: "Springfield" }, { name: "Worcester" }] },
      { state: "Michigan", cities: [{ name: "Ann Arbor" }, { name: "Dearborn" }, { name: "Detroit" }, { name: "Flint" }, { name: "Grand Rapids" }, { name: "Kalamazoo" }, { name: "Lansing" }, { name: "Livonia" }, { name: "Sterling Heights" }, { name: "Warren" }, { name: "Westland" }] },
      { state: "Minnesota", cities: [{ name: "Bloomington" }, { name: "Duluth" }, { name: "Minneapolis" }, { name: "Rochester" }, { name: "St. Paul" }] },
      { state: "Mississippi", cities: [{ name: "Biloxi" }, { name: "Gulfport" }, { name: "Jackson" }] },
      { state: "Missouri", cities: [{ name: "Columbia" }, { name: "Independence" }, { name: "Kansas City" }, { name: "Springfield" }, { name: "St. Louis" }] },
      { state: "Montana", cities: [{ name: "Billings" }, { name: "Bozeman" }, { name: "Missoula" }] },
      { state: "Nebraska", cities: [{ name: "Lincoln" }, { name: "Omaha" }] },
      { state: "Nevada", cities: [{ name: "Carson City" }, { name: "Henderson" }, { name: "Las Vegas" }, { name: "North Las Vegas" }, { name: "Reno" }] },
      { state: "New Hampshire", cities: [{ name: "Manchester" }, { name: "Nashua" }] },
      { state: "New Jersey", cities: [{ name: "Camden" }, { name: "Clifton" }, { name: "Elizabeth" }, { name: "Jersey City" }, { name: "Newark" }, { name: "Paterson" }, { name: "Trenton" }] },
      { state: "New Mexico", cities: [{ name: "Albuquerque" }, { name: "Las Cruces" }, { name: "Santa Fe" }] },
      { state: "New York", cities: [{ name: "Albany" }, { name: "Binghamton" }, { name: "Buffalo" }, { name: "New York City" }, { name: "Rochester" }, { name: "Syracuse" }, { name: "Yonkers" }] },
      { state: "North Carolina", cities: [{ name: "Asheville" }, { name: "Cary" }, { name: "Charlotte" }, { name: "Durham" }, { name: "Fayetteville" }, { name: "Greensboro" }, { name: "High Point" }, { name: "Raleigh" }, { name: "Wilmington" }, { name: "Winston-Salem" }] },
      { state: "North Dakota", cities: [{ name: "Fargo" }] },
      { state: "Ohio", cities: [{ name: "Akron" }, { name: "Cincinnati" }, { name: "Cleveland" }, { name: "Columbus" }, { name: "Dayton" }, { name: "Toledo" }, { name: "Youngstown" }] },
      { state: "Oklahoma", cities: [{ name: "Broken Arrow" }, { name: "Norman" }, { name: "Oklahoma City" }, { name: "Tulsa" }] },
      { state: "Oregon", cities: [{ name: "Beaverton" }, { name: "Eugene" }, { name: "Gresham" }, { name: "Hillsboro" }, { name: "Portland" }, { name: "Salem" }] },
      { state: "Pennsylvania", cities: [{ name: "Allentown" }, { name: "Erie" }, { name: "Philadelphia" }, { name: "Pittsburgh" }, { name: "Reading" }] },
      { state: "Rhode Island", cities: [{ name: "Providence" }, { name: "Warwick" }] },
      { state: "South Carolina", cities: [{ name: "Charleston" }, { name: "Columbia" }, { name: "Greenville" }, { name: "North Charleston" }] },
      { state: "South Dakota", cities: [{ name: "Sioux Falls" }] },
      { state: "Tennessee", cities: [{ name: "Chattanooga" }, { name: "Clarksville" }, { name: "Knoxville" }, { name: "Memphis" }, { name: "Nashville" }] },
      { state: "Texas", cities: [{ name: "Abilene" }, { name: "Amarillo" }, { name: "Arlington" }, { name: "Austin" }, { name: "Beaumont" }, { name: "Brownsville" }, { name: "Carrollton" }, { name: "College Station" }, { name: "Corpus Christi" }, { name: "Dallas" }, { name: "Denton" }, { name: "El Paso" }, { name: "Fort Worth" }, { name: "Frisco" }, { name: "Garland" }, { name: "Grand Prairie" }, { name: "Houston" }, { name: "Irving" }, { name: "Killeen" }, { name: "Laredo" }, { name: "Lewisville" }, { name: "Lubbock" }, { name: "McAllen" }, { name: "McKinney" }, { name: "Mesquite" }, { name: "Midland" }, { name: "Odessa" }, { name: "Pasadena" }, { name: "Pearland" }, { name: "Plano" }, { name: "Richardson" }, { name: "Round Rock" }, { name: "San Antonio" }, { name: "Tyler" }, { name: "Waco" }, { name: "Wichita Falls" }] },
      { state: "Utah", cities: [{ name: "Ogden" }, { name: "Provo" }, { name: "Salt Lake City" }, { name: "West Jordan" }, { name: "West Valley City" }] },
      { state: "Vermont", cities: [{ name: "Burlington" }] },
      { state: "Virginia", cities: [{ name: "Alexandria" }, { name: "Arlington" }, { name: "Chesapeake" }, { name: "Hampton" }, { name: "Newport News" }, { name: "Norfolk" }, { name: "Portsmouth" }, { name: "Richmond" }, { name: "Virginia Beach" }] },
      { state: "Washington", cities: [{ name: "Bellevue" }, { name: "Everett" }, { name: "Kent" }, { name: "Renton" }, { name: "Seattle" }, { name: "Spokane" }, { name: "Tacoma" }, { name: "Vancouver" }] },
      { state: "West Virginia", cities: [{ name: "Charleston" }, { name: "Huntington" }] },
      { state: "Wisconsin", cities: [{ name: "Green Bay" }, { name: "Kenosha" }, { name: "Madison" }, { name: "Milwaukee" }, { name: "Racine" }] },
      { state: "Wyoming", cities: [{ name: "Cheyenne" }] },
    ];
  
    const location = locations.find((loc) => loc.state.toLowerCase().replace(/\s+/g, '-') === state);
    const stateCities = location ? location.cities : [];
  
    return new Response(JSON.stringify(stateCities), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }