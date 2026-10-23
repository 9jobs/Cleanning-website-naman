// Services-only editorial content. Shared service identifiers and forms stay unchanged.
export type ServiceArea = { title: string; items: string[] };
export type ServicePageContent = {
  label: string;
  lead: string;
  heading: string;
  description: string;
  heroDescription: string;
  scopeHeading: string;
  processHeading: string;
  extrasHeading: string;
  detailsHeading: string;
  scopeNote: string;
  image: string;
  alt: string;
  supportImage: string;
  supportAlt: string;
  preparation: string;
  areas: ServiceArea[];
  details: string[];
  steps: [string, string][];
  questions: [string, string][];
  related: string[];
  closing: string;
};

export const servicePages: Record<string, ServicePageContent> = {
  "house-cleaning": {
    heroDescription:
      "Keep busy rooms comfortable with regular visits planned around your household, favourite finishes and the way you use your home.",
    scopeHeading: "Everyday rooms, thoughtfully maintained.",
    processHeading: "From household priorities to a steady routine.",
    extrasHeading: "Choose the details that matter to you.",
    detailsHeading: "Tell us how your household works.",
    scopeNote:
      "Use the checklist to set a practical baseline for each visit, then discuss priorities as your routine changes.",
    label: "REGULAR HOME CARE",
    lead: "Routine residential cleaning for everyday home maintenance.",
    heading: "A cleaner home, built into your routine.",
    description:
      "Regular House Cleaning looks after kitchens, bathrooms, bedrooms and living areas. Choose the rooms and priorities for your house or townhouse, with a checklist and visit frequency agreed before cleaning begins.",
    image: "/images/house-cleaning.webp",
    alt: "Cleaner wiping a kitchen bench in a bright residential home",
    supportImage: "/images/airbnb-cover.webp",
    supportAlt: "Cleaner wiping a coffee table in a residential living room",
    preparation:
      "Clear loose belongings from agreed surfaces. Share access instructions, pets, delicate finishes and rooms that should be left untouched.",
    areas: [
      {
        title: "Kitchen",
        items: [
          "Wipe accessible kitchen benches",
          "Clean the sink and splashback",
          "Wipe appliance exteriors",
        ],
      },
      {
        title: "Bathrooms",
        items: [
          "Clean showers, basins and toilets",
          "Wipe mirrors and accessible fixtures",
          "Mop suitable bathroom floors",
        ],
      },
      {
        title: "Everyday living",
        items: [
          "Dust accessible bedroom and lounge surfaces",
          "Vacuum bedrooms and living areas",
          "Mop suitable hard floors",
        ],
      },
    ],
    details: [
      "Bedrooms, bathrooms and living areas",
      "Preferred weekly or fortnightly routine",
      "Pets, parking and surface-care instructions",
    ],
    steps: [
      [
        "Tell us about your home",
        "Share the room numbers and the areas you use most.",
      ],
      [
        "Agree your routine",
        "Confirm visit frequency, tasks and the written quote.",
      ],
      [
        "Prepare for the visit",
        "Arrange access and clear the agreed surfaces.",
      ],
    ],
    questions: [
      [
        "What is included in regular house cleaning?",
        "Kitchen surfaces, bathrooms, accessible dusting, vacuuming and mopping can be included. Your written checklist confirms the rooms and tasks for each visit.",
      ],
      [
        "Can I choose the rooms you clean?",
        "Yes. Share your priorities and any rooms to leave untouched when the scope is agreed.",
      ],
      [
        "Are appliance interiors included?",
        "Oven and fridge interiors are optional requests and need a separate scope and quote.",
      ],
    ],
    related: [
      "one-off-cleaning",
      "apartment-cleaning",
      "bedroom-living-area-cleaning",
    ],
    closing: "A fresher home. A simpler routine.",
  },
  "one-off-cleaning": {
    heroDescription:
      "Catch up after a busy period or prepare for an occasion with a single appointment focused on the areas you choose.",
    scopeHeading: "A focused reset, room by room.",
    processHeading: "Plan a refresh without an ongoing commitment.",
    extrasHeading: "Add a little extra to this visit.",
    detailsHeading: "Share the priorities for your single clean.",
    scopeNote:
      "Set the focus before the appointment so the available time goes towards the rooms that need it most.",
    label: "FLEXIBLE HOME CARE",
    lead: "A single residential clean for the rooms that need extra attention.",
    heading: "One visit, shaped around your priorities.",
    description:
      "One-Off Cleaning is for a home refresh without an ongoing schedule. Request a kitchen and bathroom clean, dusting, surface care and floors, then agree a realistic checklist for the condition of your home.",
    image: "/images/house-cleaning.webp",
    alt: "Cleaner wiping a residential kitchen island",
    supportImage: "/images/home-benefit.webp",
    supportAlt: "Cleaner wiping a wooden dining table at home",
    preparation:
      "Choose priority rooms and clear personal items from surfaces. Mention built-up grime, delicate materials and any appliances you want assessed separately.",
    areas: [
      {
        title: "Kitchen & bathrooms",
        items: [
          "Refresh accessible kitchen surfaces",
          "Clean bathroom fixtures",
          "Wipe sinks and mirrors",
        ],
      },
      {
        title: "Living areas",
        items: [
          "Dust accessible furniture",
          "Wipe agreed surfaces",
          "Vacuum or mop suitable floors",
        ],
      },
      {
        title: "Your priority rooms",
        items: [
          "Focus on the rooms you choose",
          "Agree tasks for a single visit",
          "Discuss extra time before confirming",
        ],
      },
    ],
    details: [
      "Priority rooms and current condition",
      "Preferred visit date",
      "Optional appliance or cupboard requests",
    ],
    steps: [
      [
        "Choose your priorities",
        "Tell us which rooms and tasks need attention.",
      ],
      ["Confirm the checklist", "Agree the scope, access and quote."],
      [
        "Plan a single visit",
        "Request your preferred date without a recurring commitment.",
      ],
    ],
    questions: [
      [
        "Is this an ongoing cleaning plan?",
        "No. One-Off Cleaning is a single visit. You can discuss regular cleaning separately if your needs change.",
      ],
      [
        "Can I focus on just a few rooms?",
        "Yes. Tell us your priority rooms so the visit can be planned around them.",
      ],
      [
        "Does a one-off clean include every task?",
        "The scope depends on your priorities, the condition of the home and the agreed time. Additional tasks must be confirmed in advance.",
      ],
    ],
    related: [
      "house-cleaning",
      "apartment-cleaning",
      "bedroom-living-area-cleaning",
    ],
    closing: "One visit. A fresher home.",
  },
  "apartment-cleaning": {
    heroDescription:
      "From compact kitchens to open-plan lounges, request care that fits your layout and works with your building’s entry arrangements.",
    scopeHeading: "A checklist for compact spaces.",
    processHeading: "A little planning for apartment access.",
    extrasHeading: "Tailor the visit to your apartment.",
    detailsHeading: "A few notes about your apartment.",
    scopeNote:
      "Compact layouts still have different needs. Identify the surfaces, fixtures and floor areas to include within your unit.",
    label: "APARTMENT CARE",
    lead: "Residential cleaning for apartments, units and compact living spaces.",
    heading: "Thoughtful care for apartment living.",
    description:
      "Apartment Cleaning focuses on the rooms and surfaces within your home. From compact kitchens to open-plan living areas, agree practical tasks for your apartment or unit and share lift, parking and entry arrangements before the visit.",
    image: "/images/hero-property-v2.webp",
    alt: "Bright vacant apartment with timber floors and an open-plan kitchen",
    supportImage: "/images/property-detail.webp",
    supportAlt: "Residential apartment kitchen with open cupboards",
    preparation:
      "Check building entry and lift arrangements. Tell us about visitor parking, access restrictions and any shared areas outside your apartment that are excluded.",
    areas: [
      {
        title: "Kitchen & dining",
        items: [
          "Wipe compact kitchen benches",
          "Clean sinks and splashbacks",
          "Wipe accessible dining surfaces",
        ],
      },
      {
        title: "Bathrooms & laundry",
        items: [
          "Clean basins, showers and toilets",
          "Wipe accessible mirrors",
          "Mop suitable wet-area floors",
        ],
      },
      {
        title: "Bedrooms & living",
        items: [
          "Dust accessible shelves and furniture",
          "Vacuum bedrooms and lounge areas",
          "Mop suitable hard floors",
        ],
      },
    ],
    details: [
      "Apartment level, lift and parking access",
      "Bedroom and bathroom numbers",
      "Compact-space priorities and delicate surfaces",
    ],
    steps: [
      [
        "Describe the apartment",
        "Share room numbers, flooring and cleaning priorities.",
      ],
      [
        "Plan building access",
        "Confirm entry, lift access and visitor parking.",
      ],
      ["Agree the visit", "Review the checklist, quote and preferred timing."],
    ],
    questions: [
      [
        "Do you clean units as well as apartments?",
        "Yes. Share the layout and room numbers so the team can plan a suitable residential cleaning scope.",
      ],
      [
        "Are shared corridors included?",
        "This service is for the interior of your residential apartment or unit. Building common areas are outside the scope.",
      ],
      [
        "Which indoor areas can I include?",
        "Share the indoor rooms and accessible surfaces you want included in your apartment cleaning checklist.",
      ],
    ],
    related: ["house-cleaning", "balcony-patio-cleaning", "move-in-cleaning"],
    closing: "A fresh apartment. Ready to enjoy.",
  },
  "property-cleaning": {
    heroDescription:
      "Keep your residential rental or vacant home ready for its next use, with attention guided by its condition and access.",
    scopeHeading: "Follow the room-by-room priorities.",
    processHeading: "Turn property notes into a practical plan.",
    extrasHeading: "Extend your property checklist.",
    detailsHeading: "Help us understand the rental.",
    scopeNote:
      "Occupied and vacant rooms need different preparation. Let us know which areas will be clear and accessible.",
    label: "PROPERTY CARE",
    lead: "Cleaning for rentals, vacant homes and managed residential properties.",
    heading: "A fresh start for your residential property.",
    description:
      "Property Cleaning supports residential rentals and vacant homes with a room-by-room scope. Share the property condition, access and priorities so kitchens, bathrooms, storage and living spaces can receive the care they need.",
    image: "/images/property-cover.webp",
    alt: "Cleaner dusting a shelf beside a residential living room",
    supportImage: "/images/property-detail.webp",
    supportAlt: "Clean residential kitchenette with open cupboards",
    preparation:
      "Confirm which rooms will be empty. Remove belongings from storage you want cleaned and arrange keys, utilities and access before the visit.",
    areas: [
      {
        title: "Kitchen & bathrooms",
        items: [
          "Wipe kitchen benches and sinks",
          "Clean bathroom fixtures",
          "Wipe agreed cupboard exteriors",
        ],
      },
      {
        title: "Bedrooms & living",
        items: [
          "Dust accessible furniture and shelves",
          "Vacuum agreed rooms",
          "Mop suitable hard floors",
        ],
      },
      {
        title: "Storage & details",
        items: [
          "Wipe empty cupboards by agreement",
          "Clean accessible door handles",
          "Discuss property-specific tasks",
        ],
      },
    ],
    details: [
      "Residential property type and condition",
      "Occupied or vacant rooms",
      "Access arrangements and priority tasks",
    ],
    steps: [
      [
        "Describe the property",
        "Share the residential layout and current condition.",
      ],
      [
        "Agree room-by-room care",
        "Confirm storage, surfaces, floors and any optional work.",
      ],
      ["Arrange access", "Agree the quote, keys and preferred visit window."],
    ],
    questions: [
      [
        "Is Property Cleaning for residential homes?",
        "Yes. It is for rentals, vacant homes and managed residential properties.",
      ],
      [
        "Can an occupied rental be cleaned?",
        "Yes. Tell us which rooms are occupied and which surfaces will be accessible so the scope can be agreed.",
      ],
      [
        "How is the property checklist agreed?",
        "Property Cleaning can support an occupied rental or vacant residential home, with the checklist agreed around its rooms and condition.",
      ],
    ],
    related: ["move-in-cleaning", "end-of-lease-cleaning", "house-cleaning"],
    closing: "Residential property care, clearly planned.",
  },
  "move-in-cleaning": {
    heroDescription:
      "Give your next chapter a fresher beginning by arranging access to your new home before unpacking starts.",
    scopeHeading: "Prepare the spaces you will use first.",
    processHeading: "Coordinate keys, cleaning and moving day.",
    extrasHeading: "Consider the finishing touches before unpacking.",
    detailsHeading: "What to share before you move in.",
    scopeNote:
      "Choose the rooms and empty storage you want prepared before your belongings arrive.",
    label: "A FRESH START",
    lead: "Residential cleaning before you settle into a new home or rental.",
    heading: "Move in. Feel at home sooner.",
    description:
      "Move-In Cleaning helps prepare a house, apartment or rental before your belongings arrive. Focus on kitchens, bathrooms, empty storage and floors, with the tasks agreed around the condition of your new home.",
    image: "/images/end-of-lease-cleaning.webp",
    alt: "Bright empty residential living area with clean timber floors",
    supportImage: "/images/property-detail.webp",
    supportAlt: "Empty residential kitchen cupboards ready for cleaning",
    preparation:
      "Plan the visit before furniture and boxes arrive where possible. Ensure water, power and keys are available, and identify any newly finished or delicate surfaces.",
    areas: [
      {
        title: "Kitchen & storage",
        items: [
          "Wipe kitchen benches and sinks",
          "Wipe empty cupboards by agreement",
          "Clean accessible appliance exteriors",
        ],
      },
      {
        title: "Bathrooms",
        items: [
          "Clean showers, basins and toilets",
          "Wipe mirrors and accessible fittings",
          "Mop suitable floors",
        ],
      },
      {
        title: "Empty living spaces",
        items: [
          "Dust accessible shelves and ledges",
          "Vacuum bedrooms and living areas",
          "Mop suitable hard floors",
        ],
      },
    ],
    details: [
      "Move-in date and key collection",
      "Empty rooms and storage to include",
      "Water, power and surface-care requirements",
    ],
    steps: [
      [
        "Share your moving plans",
        "Tell us when keys are available and belongings will arrive.",
      ],
      ["Set the priorities", "Agree rooms, empty cupboards and floor care."],
      [
        "Prepare your new home",
        "Confirm access, utilities and the written scope.",
      ],
    ],
    questions: [
      [
        "Should I book before moving furniture in?",
        "An empty home usually makes agreed surfaces easier to reach. Share your moving schedule so suitable timing can be discussed.",
      ],
      [
        "Can you clean inside cupboards?",
        "Empty cupboard interiors can be included by prior agreement. Confirm which storage areas should be cleaned.",
      ],
      [
        "Can I request cleaning for a new rental?",
        "Yes. Share the property layout, current condition and key collection date.",
      ],
    ],
    related: [
      "apartment-cleaning",
      "property-cleaning",
      "end-of-lease-cleaning",
    ],
    closing: "Start your next chapter with a fresher home.",
  },
  "end-of-lease-cleaning": {
    heroDescription:
      "Bring your rental checklist and moving dates together so the clean can be scheduled before you return the keys.",
    scopeHeading: "Work through your vacate checklist.",
    processHeading: "Plan the clean before the keys go back.",
    extrasHeading: "Discuss extra tasks on your agent checklist.",
    detailsHeading: "Details to organise before key return.",
    scopeNote:
      "Use the property checklist to confirm accessible rooms, empty storage and any optional work.",
    label: "MOVING HOME",
    lead: "Detailed residential cleaning when it is time to move out.",
    heading: "A practical plan for your move-out clean.",
    description:
      "End of Lease / Move-Out Cleaning is planned around your rental home and agreed checklist. Share the condition report, agent requirements and moving dates so the team can review kitchens, bathrooms, empty rooms and accessible storage.",
    image: "/images/end-of-lease-cleaning.webp",
    alt: "Vacant residential living room with timber floors",
    supportImage: "/images/end-of-lease-detail.webp",
    supportAlt: "Cleaner wiping a low skirting board in an empty home",
    preparation:
      "Remove belongings and empty the storage included in the scope. Keep water and power available and share the condition report, access instructions and key return date.",
    areas: [
      {
        title: "Kitchen",
        items: [
          "Clean accessible benches, sink and splashback",
          "Wipe empty cupboards by agreement",
          "Discuss oven or fridge interiors separately",
        ],
      },
      {
        title: "Bathrooms",
        items: [
          "Clean showers, basins and toilets",
          "Wipe mirrors and accessible fixtures",
          "Mop suitable bathroom floors",
        ],
      },
      {
        title: "Rooms & floors",
        items: [
          "Dust accessible ledges and skirting",
          "Vacuum empty bedrooms and living areas",
          "Mop suitable hard floors",
        ],
      },
    ],
    details: [
      "Agent checklist and condition report",
      "Vacating date and key return timing",
      "Empty rooms, utilities and optional extras",
    ],
    steps: [
      [
        "Share the rental checklist",
        "Send the property details and agent requirements.",
      ],
      ["Confirm the scope", "Agree rooms, extras, quote and access."],
      [
        "Prepare for moving day",
        "Remove belongings and confirm the preferred visit window.",
      ],
    ],
    questions: [
      [
        "Do you guarantee a bond return?",
        "No. Bond decisions depend on the tenancy, property condition and inspection. Cleaning is carried out to an agreed scope.",
      ],
      [
        "Is carpet steam cleaning included?",
        "Specialist carpet treatments are not assumed. Discuss any agent requirements before the scope is confirmed.",
      ],
      [
        "Does the property need to be empty?",
        "Please remove belongings and empty the rooms and storage included in the checklist. Tell us about anything that will remain.",
      ],
    ],
    related: ["move-in-cleaning", "property-cleaning", "apartment-cleaning"],
    closing: "Leave the cleaning clearly planned.",
  },
  "airbnb-cleaning": {
    heroDescription:
      "Prepare a welcoming return for the next guests with a room reset based on your access details and presentation instructions.",
    scopeHeading: "Focus on the rooms guests have used.",
    processHeading: "Coordinate the gap between guest stays.",
    extrasHeading: "Refine the reset for your next guests.",
    detailsHeading: "Notes that help with a changeover.",
    scopeNote:
      "Follow the agreed presentation notes, with linen, supplies and guest timing confirmed in advance.",
    label: "SHORT-STAY CARE",
    lead: "Cleaning between guest stays in residential short-stay homes.",
    heading: "A considered reset between guest visits.",
    description:
      "Airbnb / Short-Stay Cleaning supports residential holiday homes and apartments between bookings. Agree the kitchen, bathroom, bedroom and living-area checklist, together with access and guest timing, before confirming the visit.",
    image: "/images/airbnb-cleaning.webp",
    alt: "Neatly presented bedroom in a residential short-stay home",
    supportImage: "/images/airbnb-cover.webp",
    supportAlt: "Cleaner wiping a coffee table in a short-stay living room",
    preparation:
      "Share guest departure and arrival times, entry instructions and presentation notes. Linen, laundry, supplies and restocking must be agreed separately.",
    areas: [
      {
        title: "Bedrooms",
        items: [
          "Dust accessible bedside surfaces",
          "Vacuum bedroom floors",
          "Discuss supplied linen changes in advance",
        ],
      },
      {
        title: "Kitchen & bathrooms",
        items: [
          "Wipe benches, sink and splashback",
          "Clean showers, basins and toilets",
          "Wipe accessible appliance exteriors",
        ],
      },
      {
        title: "Living spaces",
        items: [
          "Wipe accessible tables and shelves",
          "Vacuum or mop suitable floors",
          "Follow agreed room-presentation notes",
        ],
      },
    ],
    details: [
      "Guest departure and next arrival windows",
      "Access details and room presentation notes",
      "Linen, supplies and restocking requests",
    ],
    steps: [
      [
        "Share the guest schedule",
        "Tell us the departure and arrival windows.",
      ],
      [
        "Agree the reset",
        "Confirm the rooms, presentation notes and any linen tasks.",
      ],
      [
        "Plan access",
        "Confirm the visit window and written quote before the next stay.",
      ],
    ],
    questions: [
      [
        "Is this for residential Airbnb properties?",
        "Yes. The service is for residential short-stay homes and apartments.",
      ],
      [
        "Are laundry and linen supplied?",
        "Laundry, linen supply and linen changes require prior agreement. They are not assumed to be included.",
      ],
      [
        "Can you guarantee a same-day turnaround?",
        "No. Timing depends on scope and availability. Confirm the guest schedule with the team before relying on a visit.",
      ],
    ],
    related: [
      "apartment-cleaning",
      "bedroom-living-area-cleaning",
      "property-cleaning",
    ],
    closing: "A fresher space for the next stay.",
  },
  "bedroom-living-area-cleaning": {
    heroDescription:
      "Bring a little order back to your resting and gathering spaces, from bedside tables to the lounge and dining area.",
    scopeHeading: "Care for the places you unwind.",
    processHeading: "Choose the rooms, then plan the refresh.",
    extrasHeading: "Personalise care for your living spaces.",
    detailsHeading: "Tell us about the rooms you enjoy.",
    scopeNote:
      "Focus on reachable furniture and floor areas, while identifying fragile belongings and anything to leave untouched.",
    label: "EVERYDAY LIVING",
    lead: "Focused care for bedrooms, lounges and everyday living areas.",
    heading: "Make room for more comfortable living.",
    description:
      "Bedroom & Living Area Cleaning focuses on the places you rest and spend time together. Choose accessible furniture, shelves and floors, with care instructions and priority rooms agreed before the visit.",
    image: "/images/airbnb.webp",
    alt: "Bright residential bedroom with neatly arranged bedding",
    supportImage: "/images/home-benefit.webp",
    supportAlt: "Cleaner wiping a residential dining table",
    preparation:
      "Put away loose personal items and identify fragile objects. Tell us about floor finishes, pets and furniture that should remain in place.",
    areas: [
      {
        title: "Bedrooms",
        items: [
          "Dust accessible bedside tables and shelves",
          "Wipe agreed furniture surfaces",
          "Vacuum accessible bedroom floors",
        ],
      },
      {
        title: "Lounge & dining",
        items: [
          "Wipe coffee and dining tables",
          "Dust accessible shelving",
          "Vacuum or mop suitable floors",
        ],
      },
      {
        title: "Finishing details",
        items: [
          "Wipe accessible handles and switches",
          "Dust reachable ledges",
          "Follow agreed surface-care instructions",
        ],
      },
    ],
    details: [
      "Bedrooms and living rooms to include",
      "Furniture access and floor finishes",
      "Fragile belongings and priority surfaces",
    ],
    steps: [
      [
        "Choose the rooms",
        "Tell us which bedrooms and living spaces need attention.",
      ],
      [
        "Agree surface care",
        "Identify delicate finishes, furniture access and floor types.",
      ],
      ["Plan the refresh", "Confirm the checklist and preferred appointment."],
    ],
    questions: [
      [
        "Can I request just a bedroom or lounge clean?",
        "Yes. Share the rooms and priorities you want included so a focused scope can be agreed.",
      ],
      [
        "Do you move heavy furniture?",
        "Heavy furniture moving is not assumed. Confirm accessible areas and any limitations before the visit.",
      ],
      [
        "Are mattresses or upholstery treated?",
        "Specialist mattress or upholstery treatments are not included in standard surface and floor cleaning.",
      ],
    ],
    related: ["house-cleaning", "one-off-cleaning", "airbnb-cleaning"],
    closing: "Comfort starts in the rooms you use most.",
  },
  "balcony-patio-cleaning": {
    heroDescription:
      "Make your outdoor corner more inviting with suitable care for reachable surfaces, taking drainage and building rules into account.",
    scopeHeading: "Outdoor surfaces within easy reach.",
    processHeading: "Review access before refreshing the outdoors.",
    extrasHeading: "Agree the outdoor details in advance.",
    detailsHeading: "Share your outdoor surface requirements.",
    scopeNote:
      "Surface materials, drainage and entry arrangements guide the tasks suitable for your balcony or patio.",
    label: "OUTDOOR HOME CARE",
    lead: "Cleaning for accessible residential balconies, patios and outdoor surfaces.",
    heading: "Freshen up your outdoor living space.",
    description:
      "Balcony / Patio Cleaning focuses on accessible outdoor areas at your home or apartment. Discuss loose debris, suitable floor surfaces, reachable railings and outdoor furniture, with drainage and access reviewed before work is agreed.",
    image: "/images/garden-cleaning.webp",
    alt: "Residential patio with outdoor seating and paved surfaces",
    supportImage: "/images/garden-detail.webp",
    supportAlt: "Cleaner wiping the railing of a residential balcony",
    preparation:
      "Clear small personal items and share building rules, surface-care guidance and drainage details. Identify fragile plants and anything that should remain untouched.",
    areas: [
      {
        title: "Outdoor floors",
        items: [
          "Remove ordinary loose debris",
          "Sweep accessible floor areas",
          "Agree suitable surface cleaning methods",
        ],
      },
      {
        title: "Reachable details",
        items: [
          "Wipe accessible railings",
          "Wipe agreed outdoor furniture surfaces",
          "Clean reachable ledges",
        ],
      },
      {
        title: "Access & care",
        items: [
          "Review drainage and water access",
          "Follow residential building requirements",
          "Agree tasks for the surface condition",
        ],
      },
    ],
    details: [
      "Balcony or patio size and access",
      "Surface materials and drainage",
      "Building rules and outdoor furniture",
    ],
    steps: [
      [
        "Describe the outdoor area",
        "Share photos, surface materials and access details.",
      ],
      [
        "Review suitable tasks",
        "Confirm drainage, building requirements and accessible areas.",
      ],
      ["Agree the visit", "Review the cleaning method, scope and quote."],
    ],
    questions: [
      [
        "Do you clean apartment balconies?",
        "Accessible residential balconies can be assessed. Share entry, drainage and building requirements with the team.",
      ],
      [
        "Is pressure washing included?",
        "Specialist pressure washing is not a confirmed inclusion. Cleaning methods are agreed for your surfaces and access.",
      ],
      [
        "Can you clean high exterior glass or façades?",
        "No high-access exterior work is assumed. The scope is limited to agreed, safely accessible residential surfaces.",
      ],
    ],
    related: ["apartment-cleaning", "house-cleaning", "one-off-cleaning"],
    closing: "Enjoy a fresher outdoor corner of home.",
  },
};
