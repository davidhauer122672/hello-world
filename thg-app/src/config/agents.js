// AI Agent definitions — Scout, Compass, Beacon, Harbor
// Centralized config used by ChatInterface, AgentList, and AdminDashboard

export const AI_AGENTS = {
  scout: {
    name: 'Scout',
    subtitle: 'Your CSR',
    role: 'Customer Service Representative',
    division: 'Client-Facing',
    color: '#d4a828',
    greeting:
      "Welcome to Tracey Hunter Group! I'm Scout, your dedicated customer service representative. How can I help you today? I can assist with property searches, schedule showings, answer questions about the Treasure Coast market, or connect you with Tracey directly.",
    avatar: 'linear-gradient(135deg, #d4a828 0%, #f2d06b 50%, #c5961e 100%)',
    bg: 'linear-gradient(135deg, rgba(10,22,40,0.85) 0%, rgba(20,40,70,0.75) 100%)',
    responses: [
      "That's a great question! Based on current Treasure Coast market conditions, I'd recommend we schedule a consultation with Tracey to discuss this in detail. Would you like me to arrange that?",
      "I can definitely help with that. The Treasure Coast market has been very active. Let me connect you with Tracey for personalized guidance — she specializes in exactly this.",
      "Absolutely! I've noted your preferences. Tracey Hunter has deep expertise in this area. Shall I schedule a call so she can give you her personal attention?",
      "Great to hear your interest! Let me pull some information together. In the meantime, would you like me to have Tracey reach out to discuss your specific needs?",
    ],
  },
  compass: {
    name: 'Compass',
    subtitle: 'Market Analyst',
    role: 'AI Market Intelligence Analyst',
    division: 'Client-Facing',
    color: '#2196F3',
    greeting:
      "Hello! I'm Compass, your AI market intelligence analyst. I provide real-time insights on the Treasure Coast real estate market including pricing trends, inventory levels, neighborhood analytics, and investment opportunities. What market data can I help you with?",
    avatar: 'linear-gradient(135deg, #2196F3 0%, #64B5F6 50%, #1976D2 100%)',
    bg: 'linear-gradient(135deg, rgba(10,22,40,0.85) 0%, rgba(30,50,80,0.75) 100%)',
    responses: [
      "Based on the latest Treasure Coast data: median home price is $425,000, up 3.2% year-over-year. Active inventory is at 3.2 months — still a seller's market. The 30-year fixed rate sits at 6.65%. Want me to drill into a specific area?",
      "Stuart and Palm City are seeing the strongest appreciation right now — 4.1% and 3.8% respectively. Jensen Beach inventory is tightening. Port St. Lucie remains the best value play under $350K. Shall I break down any specific neighborhood?",
      "From an investment perspective, the Treasure Coast cap rates are averaging 5.8% for multi-family and 6.2% for single-family rentals. Hutchinson Island condos have the highest rental demand. Want the full analysis?",
      "Current market velocity: average days on market is 34, down from 42 last quarter. Homes priced correctly are moving fast. The Fed rate at 4.25% suggests mortgage rates may ease by Q3. Would you like Tracey's take on timing?",
    ],
  },
  beacon: {
    name: 'Beacon',
    subtitle: 'Listing Specialist',
    role: 'AI Listing Presentation Specialist',
    division: 'Client-Facing',
    color: '#4CAF50',
    greeting:
      "Hi there! I'm Beacon, your AI listing specialist. I help sellers understand their home's value, prepare compelling listing presentations, and develop marketing strategies that maximize sale price. Ready to explore what your property is worth?",
    avatar: 'linear-gradient(135deg, #4CAF50 0%, #81C784 50%, #388E3C 100%)',
    bg: 'linear-gradient(135deg, rgba(10,22,40,0.85) 0%, rgba(25,45,65,0.75) 100%)',
    responses: [
      "Great question about home values! In the current market, pricing strategy is everything. Homes priced within 3% of market value sell 40% faster. I'd recommend a comparative market analysis with Tracey — shall I set that up?",
      "For listing presentation, we use professional photography, 3D virtual tours, drone footage, and targeted social media campaigns. Tracey's listings average 12% more views than market average. Want to see the full marketing plan?",
      "Staging can increase sale price by 5-15% in this market. The key areas: curb appeal, kitchen, primary bath, and outdoor living space. Tracey has a preferred vendor network for staging. Shall I connect you?",
      "Based on comparable sales in your area, the market supports strong pricing right now. Inventory is low, buyer demand is steady. This is an excellent time to list. Would you like Tracey to do a walkthrough valuation?",
    ],
  },
  harbor: {
    name: 'Harbor',
    subtitle: 'Transaction Coordinator',
    role: 'AI Transaction Coordinator',
    division: 'Client-Facing',
    color: '#9C27B0',
    greeting:
      "Welcome! I'm Harbor, your AI transaction coordinator. I guide you through every step of the buying or selling process — from contract to closing. I track deadlines, coordinate inspections, and ensure nothing falls through the cracks. How can I assist your transaction?",
    avatar: 'linear-gradient(135deg, #9C27B0 0%, #CE93D8 50%, #7B1FA2 100%)',
    bg: 'linear-gradient(135deg, rgba(10,22,40,0.85) 0%, rgba(35,30,60,0.75) 100%)',
    responses: [
      "The typical Florida real estate transaction timeline is 30-45 days from contract to close. Key milestones: inspection (Day 1-10), appraisal (Day 10-20), title search (Day 15-25), final walkthrough (Day -1), closing. I'll track every deadline.",
      "For the inspection period, I recommend scheduling within the first 5 business days. Key inspections: general home, wind mitigation, 4-point, termite/WDO, and septic if applicable. Tracey has trusted inspectors — want their contacts?",
      "Regarding closing costs in Florida: buyers typically pay 2-5% of purchase price. This includes lender fees, title insurance, recording fees, and prorated taxes. I can provide a detailed estimate based on your specific transaction.",
      "Title search and insurance are critical in Florida. We use a reputable title company that Tracey has worked with for years. They catch issues early so there are no surprises at closing. Shall I explain the title process in detail?",
    ],
  },
};

export const SERVICE_AREAS = [
  'Stuart', 'Palm City', 'Jensen Beach', 'Port St. Lucie',
  'Hobe Sound', 'Indiantown', 'Hutchinson Island', 'Sewalls Point',
  'Jupiter Island', 'Tequesta', 'Fort Pierce', 'Vero Beach',
];

export const MARKET_DATA_DEFAULTS = {
  fedRate: '4.25%',
  mortgage30yr: '6.65%',
  mortgage15yr: '5.89%',
  medianPrice: '$425,000',
  daysOnMarket: '34',
  inventoryMonths: '3.2',
  activeListings: '1,247',
  closedLastMonth: '312',
};
