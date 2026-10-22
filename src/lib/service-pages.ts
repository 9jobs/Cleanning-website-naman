// Services-only editorial content. Shared service identifiers and forms stay unchanged.
export type ServiceArea = { title: string; items: string[] };
export type ServicePageContent = {
  label: string;
  lead: string;
  heading: string;
  description: string;
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
    label: "HOUSE & PROPERTY CARE",
    lead: "Routine care or a one-off clean for the place you call home.",
    heading: "A home clean shaped around your routine.",
    description:
      "House Cleaning covers kitchens, bathrooms, bedrooms and everyday living areas. Request routine upkeep or a single visit, with the rooms and priorities agreed for your home.",
    image: "/images/house-cleaning.webp",
    alt: "Cleaner wiping an island in a bright Australian home",
    supportImage: "/images/airbnb.webp",
    supportAlt:
      "Neatly presented bedroom with light bedding and natural daylight",
    preparation:
      "Clear loose items from the agreed surfaces and floors. Share access instructions, pets and any delicate finishes before your visit.",
    areas: [
      {
        title: "Kitchen",
        items: [
          "Benchtops, stovetop and sink",
          "Accessible splashbacks and cupboard exteriors",
        ],
      },
      {
        title: "Bathrooms",
        items: [
          "Basins, toilets and shower screens",
          "Accessible mirrors and bathroom surfaces",
        ],
      },
      {
        title: "Living areas",
        items: [
          "Dust accessible furniture and surfaces",
          "Vacuum carpets and mop hard floors",
        ],
      },
    ],
    details: [
      "Your property type and room numbers",
      "Routine or one-off cleaning requirements",
      "Priority areas, pets and access instructions",
    ],
    steps: [
      ["Choose your home clean", "Request routine upkeep or a single visit."],
      [
        "Share the room details",
        "Describe the rooms, surface care and tasks that matter.",
      ],
      [
        "Confirm the agreed scope",
        "The team reviews your request, quote and availability.",
      ],
    ],
    questions: [
      [
        "Can I request routine or one-off House Cleaning?",
        "Yes. Share your preferred frequency or request a single visit. Scope and availability are confirmed with the team.",
      ],
      [
        "Are appliance interiors included?",
        "Fridge detailing is an optional request, included only when agreed in your quote.",
      ],
      [
        "How do I request a more detailed clean?",
        "Describe the condition and any built-up dirt. Property Cleaning can be discussed for a broader property-specific checklist.",
      ],
    ],
    related: ["property-cleaning", "end-of-lease-cleaning", "one-off-cleaning"],
    closing: "A home clean that fits the way you live.",
  },
  "property-cleaning": {
    label: "CARE FOR THE WHOLE PROPERTY",
    lead: "A practical clean for rentals, vacant spaces and managed properties.",
    heading: "A clear checklist for the property’s next stage.",
    description:
      "Property Cleaning supports rental, vacant and managed residential properties. Tell us about the layout, condition and purpose of the clean so the scope can be tailored to the property.",
    image: "/images/property-cover.webp",
    alt: "Male cleaner wiping built-in shelves in a vacant apartment",
    supportImage: "/images/property-detail.webp",
    supportAlt: "Clean apartment kitchenette with open empty cupboards",
    preparation:
      "Explain whether the property is occupied or vacant, clear access to agreed areas and share keys, parking and property-manager instructions.",
    areas: [
      {
        title: "Rooms & floors",
        items: [
          "Accessible living, bedroom and floor areas",
          "Dusting, vacuuming and mopping to the agreed scope",
          "Identify any delicate or damaged finishes",
        ],
      },
      {
        title: "Kitchen & bathroom",
        items: [
          "Kitchen surfaces, sink and accessible cupboard exteriors",
          "Basins, toilets and agreed bathroom surfaces",
          "Detail priorities based on the property’s condition",
        ],
      },
      {
        title: "Storage & handover",
        items: [
          "Empty cupboards and wardrobes where agreed",
          "Property-specific presentation checklist",
          "Discuss fridge detailing extras",
        ],
      },
    ],
    details: [
      "Property type, size and current condition",
      "Rental, vacant or managed-property requirements",
      "Access, handover timing and optional extras",
    ],
    steps: [
      [
        "Describe the property",
        "Share its layout, condition and the reason for cleaning.",
      ],
      [
        "Agree the checklist",
        "Review priority rooms, storage and optional work.",
      ],
      [
        "Confirm the visit",
        "The team confirms the quote, access and availability.",
      ],
    ],
    questions: [
      [
        "Who is Property Cleaning for?",
        "It is for rental, vacant and managed residential properties where the clean needs a property-specific checklist.",
      ],
      [
        "Can occupied properties be cleaned?",
        "Tell us what remains in the property and which surfaces can be accessed. The team confirms a suitable scope.",
      ],
      [
        "How is the property cleaning scope agreed?",
        "Property Cleaning follows a checklist shaped around rental, vacant or managed-property requirements. Share your priorities and property condition so the scope can be confirmed.",
      ],
    ],
    related: [
      "house-cleaning",
      "end-of-lease-cleaning",
      "construction-cleaning",
    ],
    closing: "Prepare the property for what comes next.",
  },
  "end-of-lease-cleaning": {
    label: "A CONSIDERED MOVE-OUT",
    lead: "Close one chapter with a cleaner space.",
    heading: "A checklist built around your property.",
    description:
      "End of lease cleaning helps prepare an empty rental property for its next stage. Share the property details and your agent’s checklist so the team can review the work required.",
    image: "/images/lease-cover.webp",
    alt: "Male cleaner mopping the floor of a vacated rental property",
    supportImage: "/images/blog-moving.webp",
    supportAlt: "Open wardrobes showing shelves and hanging space",
    preparation:
      "Arrange for belongings to be removed and cupboards emptied. Discuss key collection, parking and property access before the appointment.",
    areas: [
      {
        title: "Kitchen & storage",
        items: [
          "Inside and outside empty cupboards and drawers",
          "Kitchen surfaces, stovetop and rangehood filters",
          "Empty wardrobes and accessible storage",
        ],
      },
      {
        title: "Bathrooms & laundry",
        items: [
          "Shower screens, basins and toilets",
          "Bathtubs and accessible bathroom surfaces",
          "Tell us about laundry requirements in your checklist",
        ],
      },
      {
        title: "Floors & finishing details",
        items: [
          "Vacuum carpets and mop hard floors",
          "Wipe accessible skirting boards",
          "Review property-specific priorities with the team",
        ],
      },
    ],
    details: [
      "Property size and room numbers",
      "Your move-out date and agent’s checklist",
      "Empty-property access and any appliance extras",
    ],
    steps: [
      [
        "Send the property details",
        "Include your move-out date, room count and inspection checklist.",
      ],
      [
        "Review the quote",
        "Agree cleaning tasks, extras and access arrangements.",
      ],
      [
        "Confirm the appointment",
        "Timing is confirmed with the team before work begins.",
      ],
    ],
    questions: [
      [
        "Is a bond return guaranteed?",
        "No. Bond decisions and inspection outcomes are made by the property agent or landlord. Cleaning is completed to the scope agreed with you.",
      ],
      [
        "Should the property be empty?",
        "Empty rooms, cupboards and wardrobes allow access to the agreed surfaces. Tell us about any items that will remain so the team can plan the clean.",
      ],
      [
        "Are appliance interiors included?",
        "Fridge detailing can be discussed separately. Share your appliance requirements when requesting a quote.",
      ],
    ],
    related: ["deep-cleaning", "oven-cleaning", "window-cleaning"],
    closing: "Plan the clean around your move.",
  },
  "commercial-cleaning": {
    label: "CARE FOR WORKING SPACES",
    lead: "A considered clean for your business.",
    heading: "Different workplaces. A clearly agreed scope.",
    description:
      "Commercial cleaning is planned around the way a business uses its space. Discuss your premises, shared areas and practical requirements so the team can shape a suitable cleaning scope.",
    image: "/images/commercial-cleaning.webp",
    alt: "Cleaner mopping the floor of a bright commercial workplace",
    supportImage: "/images/service-office.webp",
    supportAlt: "Shared workplace with desks, plants and meeting areas",
    preparation:
      "Nominate a site contact, identify restricted areas and explain entry procedures. Timing and site requirements need to be agreed in advance.",
    areas: [
      {
        title: "Shared surfaces",
        items: [
          "Communal desks and workstations",
          "Agreed high-touch contact points",
        ],
      },
      {
        title: "Floors & facilities",
        items: ["Vacuum carpets and runners", "Mop accessible hard floors"],
      },
      {
        title: "Staff spaces",
        items: [
          "Kitchen benches, sinks and break rooms",
          "Standard rubbish and recycling bins",
        ],
      },
    ],
    details: [
      "Premises type, size and layout",
      "Operating hours and preferred visit times",
      "Access procedures and an on-site contact",
    ],
    steps: [
      [
        "Discuss your site",
        "Share the spaces used by staff, visitors and customers.",
      ],
      [
        "Agree the requirements",
        "Review surfaces, frequency and access considerations.",
      ],
      [
        "Confirm the scope",
        "The team confirms the work and appointment arrangements with you.",
      ],
    ],
    questions: [
      [
        "Which business spaces can I enquire about?",
        "Existing services cover offices, retail stores, communal facilities and shared workplaces. Describe your premises so the team can confirm suitability.",
      ],
      [
        "Can cleaning fit around business hours?",
        "Share your operating hours and preferred timing. Scheduling and access are discussed before any visit is confirmed.",
      ],
      [
        "Can the scope change between sites?",
        "Yes. Each enquiry should describe its layout, shared facilities and cleaning priorities. The final scope is specific to the agreed site.",
      ],
    ],
    related: ["office-cleaning", "window-cleaning", "deep-cleaning"],
    closing: "Let’s discuss your working space.",
  },
  "airbnb-cleaning": {
    label: "THOUGHTFUL GUEST CHANGEOVERS",
    lead: "A fresh welcome starts with the details.",
    heading: "Clean between stays. Prepare for the next arrival.",
    description:
      "Changeover cleaning for short-stay properties focuses on guest-facing rooms and surfaces. Share your booking calendar, property instructions and priorities so each request can be reviewed.",
    image: "/images/airbnb-cover.webp",
    alt: "Male cleaner wiping a bedside table in a short-stay bedroom",
    supportImage: "/images/kitchen.webp",
    supportAlt: "Guest kitchen with clear benchtops and a bright dining space",
    preparation:
      "Provide check-out and check-in times, entry instructions and a property checklist. Timing and any additional tasks must be confirmed before the changeover.",
    areas: [
      {
        title: "Bedrooms & living",
        items: [
          "Dust furniture and accessible decor",
          "Vacuum flooring and mop hard surfaces",
        ],
      },
      {
        title: "Bathrooms",
        items: [
          "Bathroom fixtures, mirrors and toilets",
          "Guest-facing surfaces and fittings",
        ],
      },
      {
        title: "Kitchen",
        items: [
          "Benchtops, sinks and agreed appliance surfaces",
          "Walkthrough for visible damage or maintenance concerns",
        ],
      },
    ],
    details: [
      "Guest changeover window and property size",
      "Entry arrangements and room-by-room instructions",
      "Any linen, towel or restocking request for separate confirmation",
    ],
    steps: [
      [
        "Share the changeover",
        "Tell us about the property and the time between stays.",
      ],
      [
        "Agree the checklist",
        "List presentation priorities and tasks needing prior arrangement.",
      ],
      [
        "Confirm access & timing",
        "The team reviews the request before agreeing the visit.",
      ],
    ],
    questions: [
      [
        "Are linen and restocking included?",
        "Linen changeovers, towel laundering and amenity restocking require prior agreement. Do not assume supply or these tasks are included in a standard request.",
      ],
      [
        "Can you guarantee a same-day changeover?",
        "No timing is guaranteed through the website. Share the full check-out and check-in window so the team can confirm whether it can be accommodated.",
      ],
      [
        "Is this service affiliated with Airbnb?",
        "No. Thrive4 Cleaning is an independent cleaning business. This service is for hosts and managers of short-stay properties.",
      ],
    ],
    related: ["construction-cleaning", "one-off-cleaning", "oven-cleaning"],
    closing: "Make the next welcome a fresh one.",
  },
  "construction-cleaning": {
    label: "CONSTRUCTION & POST-BUILD CLEANING",
    lead: "The final clean after building or renovation work.",
    heading: "From completed works to a presentation-ready space.",
    description:
      "Construction Cleaning focuses on ordinary settled dust, light residue and final presentation after building, renovation or maintenance work. Site condition and access are reviewed before a scope is agreed.",
    image: "/images/construction-cover.webp",
    alt: "Male cleaner removing ordinary settled dust from newly fitted shelves",
    supportImage: "/images/construction-detail.webp",
    supportAlt: "Newly renovated bathroom with clean tiles and fittings",
    preparation:
      "Confirm building work has finished and the space is ready for cleaning access. Share builder instructions, delicate new finishes and any remaining residue or materials.",
    areas: [
      {
        title: "Floors & surfaces",
        items: [
          "Ordinary settled dust on agreed accessible surfaces",
          "Vacuuming or mopping suitable finished floors",
        ],
      },
      {
        title: "Fittings & fixtures",
        items: [
          "Accessible skirting, fittings and finished surfaces",
          "Surface care guided by the installed materials",
        ],
      },
      {
        title: "Light residue & presentation",
        items: [
          "Discuss small, non-hazardous debris and residue",
          "Final presentation tasks agreed for the completed space",
        ],
      },
    ],
    details: [
      "New-build, renovation or maintenance-work details",
      "Area, finish types and photos of the current condition",
      "Access, handover timing and remaining light debris",
    ],
    steps: [
      [
        "Describe the completed work",
        "Explain the property, finishes and remaining dust or residue.",
      ],
      [
        "Review the site requirements",
        "Confirm access and tasks suitable for the finished surfaces.",
      ],
      [
        "Agree the final clean",
        "The team confirms scope, quote and availability.",
      ],
    ],
    questions: [
      [
        "What is included in Construction Cleaning?",
        "The agreed scope may include ordinary dust, light debris, surface and floor cleaning, and final presentation tasks in completed spaces.",
      ],
      [
        "Do you handle hazardous material or heavy construction waste?",
        "Hazardous waste handling, heavy construction waste disposal and regulated specialist cleaning are not confirmed services. Such material must be identified before a scope is discussed.",
      ],
      [
        "Can I request cleaning after renovation work?",
        "Yes. Share what work was completed, whether trades have finished, the surface types and photos of remaining residue. Access and suitability are confirmed before the visit.",
      ],
    ],
    related: ["property-cleaning", "commercial-cleaning", "window-cleaning"],
    closing: "Plan the final clean after the final trade.",
  },
  "office-cleaning": {
    label: "SPACE TO DO YOUR BEST WORK",
    lead: "A clearer workspace, from desk to meeting room.",
    heading: "A workplace checklist, zone by zone.",
    description:
      "Office cleaning focuses on the rooms your team uses every day: workstations, meeting areas, shared kitchens and amenities. Agree the work around your office layout and operating requirements.",
    image: "/images/office-cover.webp",
    alt: "Male cleaner vacuuming between desks in a sunlit office",
    supportImage: "/images/office-detail-male.webp",
    supportAlt: "Male cleaner wiping the bench in an office shared kitchen",
    preparation:
      "Clear desk surfaces intended for cleaning, secure documents and identify restricted equipment or rooms. Agree entry and alarm procedures with your site contact.",
    areas: [
      {
        title: "Desks & meeting rooms",
        items: [
          "Clear work surfaces and reception counters",
          "Meeting tables and accessible shared surfaces",
        ],
      },
      {
        title: "Kitchens & amenities",
        items: [
          "Staff kitchen benches and sinks",
          "Restrooms, mirrors and hand basins",
        ],
      },
      {
        title: "Floors & waste",
        items: [
          "Vacuum carpets and mop hard flooring",
          "Empty standard office waste bins",
        ],
      },
    ],
    details: [
      "Desk numbers, meeting rooms and shared facilities",
      "Opening hours and preferred cleaning times",
      "A site contact, entry procedures and restricted areas",
    ],
    steps: [
      [
        "Map your office",
        "Describe workstations and the shared areas used by the team.",
      ],
      [
        "Discuss practical access",
        "Agree suitable timing and entry procedures with your contact.",
      ],
      [
        "Confirm the checklist",
        "The team confirms the office-specific tasks before the visit.",
      ],
    ],
    questions: [
      [
        "Will papers and equipment be moved?",
        "Clear the surfaces you want cleaned and identify items that should not be touched. Document and equipment handling requirements must be agreed in advance.",
      ],
      [
        "Can I request a particular cleaning time?",
        "Share opening hours and preferred visit times. Availability, entry and any alarm procedures need to be confirmed with the team.",
      ],
      [
        "How does this differ from commercial cleaning?",
        "Office cleaning is specifically organised around desks, meeting rooms, reception and staff facilities. Commercial cleaning is the broader category for other business premises.",
      ],
    ],
    related: ["commercial-cleaning", "deep-cleaning", "window-cleaning"],
    closing: "Plan a clean that works for your office.",
  },
  "window-cleaning": {
    label: "LET THE DAYLIGHT IN",
    lead: "A clearer view of your space.",
    heading: "Start with the glass. Plan for the access.",
    description:
      "Window cleaning focuses on interior glass, accessible sills and tracks. Accessible exterior panes can be discussed as part of your enquiry, with access and suitability confirmed before work is agreed.",
    image: "/images/window-cleaning.webp",
    alt: "Gloved hand using a squeegee on an accessible window",
    supportImage: "/images/window-detail-male.webp",
    supportAlt:
      "Male cleaner wiping accessible window tracks with a cloth and brush",
    preparation:
      "Clear items from sills and move small obstacles away from windows. Explain locks, screens, height and any access restrictions before the visit.",
    areas: [
      {
        title: "Interior glass",
        items: [
          "Requested interior panes",
          "Accessible internal sills, tracks and frames",
        ],
      },
      {
        title: "Exterior enquiries",
        items: [
          "Describe accessible exterior panes",
          "Confirm access and agreed scope with the team",
        ],
      },
      {
        title: "Access review",
        items: [
          "Window height and opening style",
          "Obstacles, screens and existing glass damage",
        ],
      },
    ],
    details: [
      "Approximate window numbers and sizes",
      "Interior or exterior glass and its height",
      "Photos, screens and access restrictions",
    ],
    steps: [
      [
        "Show us the windows",
        "Share pane numbers, height and photographs if helpful.",
      ],
      [
        "Review access",
        "The team confirms which requested windows are suitable.",
      ],
      [
        "Agree the clean",
        "Scope and access arrangements are confirmed before the appointment.",
      ],
    ],
    questions: [
      [
        "Can I request exterior windows?",
        "Accessible exterior panes can be discussed. Share height and access details so the team can confirm suitability before quoting.",
      ],
      [
        "Do you offer rope-access or high-rise cleaning?",
        "These capabilities are not confirmed. Do not assume high-rise, rope-access or specialist equipment is included; describe the site for assessment.",
      ],
      [
        "Are tracks and frames included?",
        "Accessible internal sills, tracks and frames can form part of the agreed scope. Mention screens, locks and any particularly detailed work when enquiring.",
      ],
    ],
    related: ["construction-cleaning", "office-cleaning", "property-cleaning"],
    closing: "Tell us about your view.",
  },
  "oven-cleaning": {
    label: "DETAILS AT THE HEART OF THE KITCHEN",
    lead: "Give the oven some focused attention.",
    heading: "An appliance clean with a clearly defined scope.",
    description:
      "Oven cleaning focuses on built-up grease and food residue. Share the appliance type and condition so the team can confirm which accessible components and surfaces are suitable to clean.",
    image: "/images/oven-cleaning.webp",
    alt: "Open oven with racks and a gloved cleaner attending to the door",
    supportImage: "/images/oven-detail-male.webp",
    supportAlt:
      "Male cleaner wiping an oven rack on a protected kitchen worktop",
    preparation:
      "Switch the oven off and allow it to cool completely. Clear the surrounding work area and share manufacturer instructions or details of damaged components.",
    areas: [
      {
        title: "Discuss for inclusion",
        items: [
          "Removable racks, runners and trays",
          "Accessible oven interior surfaces",
          "Door glass and exterior controls",
        ],
      },
      {
        title: "Outside the cleaning scope",
        items: [
          "Electrical repairs or fault diagnosis",
          "Heating-element replacement",
          "Unagreed dismantling or appliance repairs",
        ],
      },
    ],
    details: [
      "Oven make, model and appliance type",
      "Current condition and photos of build-up",
      "Manufacturer care instructions and existing damage",
    ],
    steps: [
      [
        "Describe the appliance",
        "Share the type, model and condition of your oven.",
      ],
      [
        "Confirm the components",
        "Agree suitable surfaces and removable parts for cleaning.",
      ],
      [
        "Prepare a cool oven",
        "Switch it off, let it cool and clear the nearby work area.",
      ],
    ],
    questions: [
      [
        "Which oven parts can be cleaned?",
        "Removable racks, trays, accessible interior surfaces, door glass and controls can be discussed. Exact components and any disassembly must be agreed for your appliance.",
      ],
      [
        "Can you repair or restore my oven?",
        "Electrical repairs and element replacement are not cleaning services. No repair, restoration or improved cooking performance is promised.",
      ],
      [
        "Can I request oven cleaning with a house clean?",
        "Yes. Oven interior cleaning is an optional request alongside relevant home-cleaning services. The team confirms the additional scope and quote.",
      ],
    ],
    related: ["property-cleaning", "house-cleaning", "end-of-lease-cleaning"],
    closing: "A little care for a hard-working appliance.",
  },
};

servicePages["deep-cleaning"] = {
  ...servicePages["property-cleaning"],
  label: "DETAILED HOME CARE",
  lead: "A detailed clean for built-up dirt and grime in your home.",
  heading: "A fresh reset for the rooms you use every day.",
  description:
    "Deep Cleaning gives your home extra attention, with detailed kitchen and bathroom care, accessible skirting boards, door frames, switches and handles. Agree the priorities for a seasonal or one-off clean.",
  areas: [
    {
      title: "Kitchen & bathroom",
      items: [
        "Detailed kitchen & bathroom clean",
        "Attention to built-up dirt and grime",
      ],
    },
    {
      title: "Surfaces & fittings",
      items: [
        "Accessible skirting boards & door frames",
        "Surfaces, switches & handles",
      ],
    },
    {
      title: "Rooms & floors",
      items: [
        "Dusting, vacuuming & mopping",
        "Priority rooms agreed before the visit",
      ],
    },
  ],
  details: [
    "Rooms and current condition",
    "Built-up dirt and priority surfaces",
    "Access and preferred one-off visit",
  ],
  questions: [
    [
      "When should I choose Deep Cleaning?",
      "Choose a detailed reset for built-up dirt, seasonal cleaning or priority areas that need more attention. The team agrees the checklist before the visit.",
    ],
    [
      "Is this a one-off service?",
      "Yes. Request a single visit and share your priorities so scope and availability can be confirmed.",
    ],
  ],
  related: ["house-cleaning", "one-off-cleaning", "property-cleaning"],
  closing: "Give your home a detailed fresh start.",
};
servicePages["one-off-cleaning"] = {
  ...servicePages["house-cleaning"],
  label: "A SINGLE VISIT, YOUR PRIORITIES",
  lead: "A single-visit House Cleaning request for priority rooms.",
  heading: "A home clean when you need it.",
  description:
    "One-Off Cleaning is a single visit for the rooms and tasks you choose. Request a kitchen and bathroom refresh, dusting, surface cleaning, vacuuming and mopping without a recurring commitment.",
  areas: [
    {
      title: "Your priority rooms",
      items: ["Choose your priority rooms", "Kitchen & bathroom refresh"],
    },
    {
      title: "Surfaces",
      items: [
        "Dusting and surface cleaning",
        "Accessible fixtures and furniture",
      ],
    },
    {
      title: "Floors",
      items: ["Vacuuming & mopping", "No recurring commitment"],
    },
  ],
  details: [
    "Rooms and priority tasks",
    "Property condition and access",
    "Your preferred visit date",
  ],
  steps: [
    ["Choose your priorities", "Tell us which rooms and tasks need attention."],
    ["Agree the checklist", "The team confirms scope, quote and access."],
    [
      "Plan a single visit",
      "Request your preferred date with no recurring commitment.",
    ],
  ],
  related: ["house-cleaning", "deep-cleaning", "property-cleaning"],
  closing: "One visit. A fresher home.",
};
