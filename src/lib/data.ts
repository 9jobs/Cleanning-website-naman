import { servicePages } from "./service-pages";

const serviceSummaries: Record<string, string> = {
  "house-cleaning":
    "Stay on top of day-to-day upkeep with a routine tailored to your household.",
  "one-off-cleaning":
    "Give your priority rooms a focused refresh, without an ongoing schedule.",
  "apartment-cleaning":
    "Make the most of compact rooms with practical care for apartments and units.",
  "property-cleaning":
    "Prepare occupied rentals and vacant homes with a room-by-room checklist.",
  "move-in-cleaning":
    "Settle into fresh rooms before furniture, boxes and belongings arrive.",
  "end-of-lease-cleaning":
    "Leave your rental ready for its next chapter with an agreed vacate scope.",
  "airbnb-cleaning":
    "Reset guest-used rooms between bookings, following your presentation notes.",
  "bedroom-living-area-cleaning":
    "Refresh the spaces where you rest, relax and spend time together.",
  "balcony-patio-cleaning":
    "Bring attention to reachable outdoor floors, railings and furniture.",
};

const serviceThumbnails: Record<string, string> = {
  "house-cleaning": "house",
  "one-off-cleaning": "house",
  "apartment-cleaning": "property",
  "property-cleaning": "property",
  "move-in-cleaning": "lease",
  "end-of-lease-cleaning": "lease",
  "airbnb-cleaning": "airbnb",
  "bedroom-living-area-cleaning": "airbnb",
  "balcony-patio-cleaning": "garden",
};

const catalogue = [
  ["house-cleaning", "Regular House Cleaning", "Residential"],
  ["one-off-cleaning", "One-Off Cleaning", "Residential"],
  ["apartment-cleaning", "Apartment Cleaning", "Residential"],
  ["property-cleaning", "Property Cleaning", "Residential"],
  ["move-in-cleaning", "Move-In Cleaning", "Residential"],
  ["end-of-lease-cleaning", "End of Lease / Move-Out Cleaning", "Residential"],
  ["airbnb-cleaning", "Airbnb / Short-Stay Cleaning", "Residential"],
  [
    "bedroom-living-area-cleaning",
    "Bedroom & Living Area Cleaning",
    "Residential",
  ],
  ["balcony-patio-cleaning", "Balcony / Patio Cleaning", "Residential"],
];
export const services = catalogue.map(([slug, name, category]) => {
  const page = servicePages[slug];
  return {
    slug,
    name,
    category,
    image: page.image,
    thumbnail: `/images/tile-${serviceThumbnails[slug]}.webp`,
    summary: serviceSummaries[slug],
    intro: page.lead,
    description: page.description,
    includes: page.areas.flatMap((area) => area.items).slice(0, 4),
    benefit: page.closing,
    extra:
      "Optional work, access and the final cleaning scope are agreed with the team.",
  };
});

// Keep historical invoice service validation intact; public pages use this list.
export const publicServices = services.filter((service) =>
  [
    "house-cleaning",
    "one-off-cleaning",
    "apartment-cleaning",
    "property-cleaning",
    "airbnb-cleaning",
  ].includes(service.slug),
);

export const faqs = [
  {
    category: "Services",
    q: "What residential cleaning services do you provide?",
    a: "Choose Regular House Cleaning, One-Off Cleaning, Apartment Cleaning, Property Cleaning or Airbnb / Short-Stay Cleaning. Scope and availability are confirmed for your home.",
  },
  {
    category: "Services",
    q: "What is included in regular house cleaning?",
    a: "Kitchen surfaces, bathrooms, accessible dusting, vacuuming and mopping can be included. Your written checklist confirms the rooms and tasks for your home.",
  },
  {
    category: "Booking",
    q: "Can I book a one-off clean?",
    a: "Yes. Choose your priority rooms and describe their condition. A single visit can be planned without an ongoing schedule.",
  },
  {
    category: "Services",
    q: "Do you clean apartments and units?",
    a: "Yes. Apartment Cleaning covers agreed rooms inside residential apartments and units. Share lift access, entry and parking details.",
  },
  {
    category: "Services",
    q: "Do you provide property cleaning?",
    a: "Yes. Property Cleaning covers agreed kitchens, bathrooms, storage and floors in residential properties. Confirm access and utilities before the visit.",
  },
  {
    category: "Services",
    q: "What is included in property cleaning?",
    a: "The residential checklist can cover kitchen and bathroom care, accessible storage, rooms and floors. Tasks and access are agreed before the visit.",
  },
  {
    category: "Services",
    q: "Do you provide Airbnb cleaning?",
    a: "Airbnb / Short-Stay Cleaning is available for residential short-stay homes and apartments. Guest timing, linen tasks and restocking need prior agreement.",
  },
  {
    category: "Services",
    q: "Can regular cleaning include bedrooms and living areas?",
    a: "Yes. Choose the bedrooms, lounge or dining spaces and the accessible surfaces and floors you want included.",
  },
  {
    category: "Services",
    q: "Can I request a focused one-off clean?",
    a: "Choose One-Off Cleaning and share your priority rooms. The team confirms suitable tasks, access and availability before the visit.",
  },
  {
    category: "Pricing",
    q: "How is residential cleaning priced?",
    a: "Published plans retain their listed rates. Your written quote confirms the residential scope, condition, access and any agreed extras before the service begins.",
  },
  {
    category: "Booking",
    q: "Can I choose priority rooms?",
    a: "Yes. Tell us which rooms matter most, surfaces needing care and any areas to leave untouched when you request a quote.",
  },
  {
    category: "Booking",
    q: "How do I request a cleaning quote?",
    a: "Choose a residential service and share your location, home type, room numbers, condition and preferred timing. The team reviews the scope and availability before confirming arrangements.",
  },
  {
    category: "Areas",
    q: "Do you clean in my suburb?",
    a: "Share your suburb and postcode so local availability can be confirmed. Submitting a request does not reserve an appointment.",
  },
];

const articleCatalogue = [
  {
    slug: "a-calm-weekly-cleaning-routine",
    title: "A Simple Weekly House Cleaning Checklist",
    category: "Home care",
    image: "/images/journal-house-male.webp",
    imageAlt: "Cleaner wiping a basin in a residential bathroom",
    read: "3 min read",
    intro:
      "A room-by-room starting point for keeping everyday spaces comfortable.",
    sections: [
      [
        "Begin with the kitchen and bathrooms",
        "Put loose belongings away, wipe suitable kitchen surfaces and clean basins, toilets and shower areas using methods suited to the finishes. Follow product and surface-care instructions.",
      ],
      [
        "Move through bedrooms and living areas",
        "Dust accessible furniture and shelves before vacuuming or mopping suitable floors. Work around fragile belongings and keep the checklist realistic for the rooms you use most.",
      ],
      [
        "Choose a routine you can maintain",
        "Regular House Cleaning can support ongoing upkeep. Share your room numbers, priorities and preferred frequency so the team can agree a practical checklist.",
      ],
    ],
  },
  {
    slug: "moving-out-cleaning-checklist",
    title: "How to Prepare for End of Lease Cleaning",
    category: "Moving home",
    image: "/images/journal-lease-male.webp",
    imageAlt: "Cleaner wiping an empty wardrobe shelf in a residential bedroom",
    read: "3 min read",
    intro:
      "Prepare access, empty storage and a clear checklist before leaving your rental.",
    sections: [
      [
        "Gather your rental information",
        "Share the condition report and agent checklist. Identify the rooms, storage areas and any appliance interiors you want reviewed before the scope is confirmed.",
      ],
      [
        "Arrange empty rooms and working utilities",
        "Remove belongings from the areas included in the clean. Keep water and power available, organise keys and tell the team if furniture will remain.",
      ],
      [
        "Confirm the scope before key return",
        "Discuss optional tasks and timing in advance. The written scope confirms the agreed cleaning; inspection decisions and bond outcomes remain with the agent or landlord.",
      ],
    ],
  },
  {
    slug: "one-off-cleaning-guide",
    title: "When to Choose a One-Off Cleaning Service",
    category: "Home care",
    image: "/images/house-cleaning.webp",
    imageAlt: "Cleaner wiping a kitchen island in a residential home",
    read: "3 min read",
    intro: "Plan a single home refresh around the rooms that need attention.",
    sections: [
      [
        "Identify the reason for a refresh",
        "A busy period, a change in routine or rooms needing extra attention can be reasons to request a single clean. List the spaces that matter most to you.",
      ],
      [
        "Set achievable priorities",
        "Describe the condition of kitchen surfaces, bathrooms, living areas and floors. Let the team know about built-up grime or delicate finishes so suitable tasks can be agreed.",
      ],
      [
        "Separate optional work",
        "Appliance interiors, empty cupboards and other extras require prior agreement. Confirm the checklist and quote before the visit rather than assuming every task is included.",
      ],
    ],
  },
  {
    slug: "apartment-cleaning-checklist",
    title: "Apartment Cleaning Checklist for Smaller Spaces",
    category: "Apartment care",
    image: "/images/property-detail.webp",
    imageAlt: "Compact residential kitchen with open cupboards",
    read: "3 min read",
    intro:
      "Plan kitchen, bathroom and living-area care for your apartment or unit.",
    sections: [
      [
        "Work with the layout",
        "List the kitchen, bathrooms, bedrooms and open-plan areas. Keep small surfaces clear so agreed benches, shelves and floors can be reached.",
      ],
      [
        "Plan entry before the appointment",
        "Share lift access, entry codes, visitor parking and building rules. Cleaning inside the apartment is separate from the building’s shared corridors or facilities.",
      ],
      [
        "Describe the indoor rooms",
        "Share your apartment layout and the indoor rooms needing attention so the cleaning scope can be assessed.",
      ],
    ],
  },
  {
    slug: "prepare-home-move-in-clean",
    title: "How to Prepare Your Home for a Move-In Clean",
    category: "Moving home",
    image: "/images/end-of-lease-cleaning.webp",
    imageAlt: "Empty residential living room with timber floors",
    read: "3 min read",
    intro: "Plan cleaning before boxes and furniture arrive at your new home.",
    sections: [
      [
        "Coordinate keys and moving dates",
        "Tell the team when access becomes available and when belongings will arrive. An empty home helps keep agreed rooms and surfaces accessible.",
      ],
      [
        "Choose the storage and surfaces",
        "Identify empty cupboards, kitchen benches, bathroom fixtures and floors you want included. Share care information for delicate or recently finished surfaces.",
      ],
      [
        "Keep the essentials available",
        "Confirm water, power, parking and entry arrangements. Review the quote and checklist before relying on an appointment in your moving schedule.",
      ],
    ],
  },
  {
    slug: "airbnb-cleaning-checklist",
    title: "Airbnb Cleaning Checklist Between Guest Stays",
    category: "Short-stay care",
    image: "/images/airbnb-cleaning.webp",
    imageAlt: "Neatly presented bedroom in a residential short-stay home",
    read: "3 min read",
    intro:
      "Agree a practical reset for a residential short-stay home or apartment.",
    sections: [
      [
        "Start with guest timing",
        "Share departure and arrival windows together with access instructions. Availability must be confirmed before planning around a changeover.",
      ],
      [
        "Review each guest-used room",
        "List kitchen surfaces, bathrooms, bedrooms and living areas. Include presentation notes and tell the team which furniture and floor surfaces need care.",
      ],
      [
        "Agree linen and supplies in advance",
        "Linen changes, laundry and restocking are separate requests. Confirm who provides supplies and what is included rather than assuming these tasks form part of every clean.",
      ],
    ],
  },
  {
    slug: "bedroom-cleaning-checklist",
    title: "Bedroom Cleaning Checklist for a Fresher Space",
    category: "Home care",
    image: "/images/airbnb.webp",
    imageAlt: "Bright residential bedroom with white bedding",
    read: "3 min read",
    intro: "A focused checklist for the room where you rest.",
    sections: [
      [
        "Put away loose belongings",
        "Clear bedside tables and agreed shelves. Identify fragile items and anything the cleaner should leave untouched.",
      ],
      [
        "Work from surfaces to floors",
        "Dust accessible furniture and ledges before vacuuming suitable floors. Cleaning under furniture depends on access; heavy furniture moving is not assumed.",
      ],
      [
        "Confirm the bedroom scope",
        "Tell the team which bedrooms to include. Mattress treatments, upholstery cleaning and linen changes are separate tasks that need specific agreement.",
      ],
    ],
  },
  {
    slug: "living-room-cleaning-tips",
    title: "Living Room Cleaning Tips for Busy Homes",
    category: "Home care",
    image: "/images/home-benefit.webp",
    imageAlt:
      "Cleaner wiping a wooden dining table in a residential living area",
    read: "3 min read",
    intro:
      "Keep everyday living areas easier to maintain with a practical cleaning plan.",
    sections: [
      [
        "Clear the everyday clutter",
        "Put away toys, remotes and personal items before cleaning. Choose accessible tables and shelves as the starting point for your checklist.",
      ],
      [
        "Match care to the surfaces",
        "Share instructions for timber, stone and other delicate finishes. Dust reachable furniture and clean floors with methods suited to their materials.",
      ],
      [
        "Choose the help you need",
        "Regular House Cleaning can include selected living spaces alongside kitchens and bathrooms. Confirm the tasks and time before booking.",
      ],
    ],
  },
  {
    slug: "balcony-patio-cleaning-checklist",
    title: "Balcony & Patio Cleaning Checklist",
    category: "Outdoor home care",
    image: "/images/garden-cleaning.webp",
    imageAlt: "Residential patio with paving and outdoor seating",
    read: "3 min read",
    intro: "Prepare accessible outdoor living areas for suitable surface care.",
    sections: [
      [
        "Describe surfaces and access",
        "Share photos of paving, tiles, railings and outdoor furniture. Mention the height, entry route and any residential building restrictions.",
      ],
      [
        "Plan around water and drainage",
        "Explain where water can be used and how the area drains. Suitable methods depend on the surfaces and access; specialist pressure washing is not assumed.",
      ],
      [
        "Protect the things you keep outside",
        "Move small personal belongings where practical and identify fragile plants. Agree which reachable surfaces, furniture and floor areas will be included.",
      ],
    ],
  },
  {
    slug: "regular-house-cleaning-frequency",
    title: "How Often Should You Book Regular House Cleaning?",
    category: "Home care",
    image: "/images/house-cleaning.webp",
    imageAlt: "Cleaner wiping a kitchen bench in a bright home",
    read: "3 min read",
    intro:
      "Choose a cleaning routine around your household and the rooms you use.",
    sections: [
      [
        "Look at your everyday routine",
        "Consider household size, room use, pets and the time available for upkeep. Your needs may change through the year, so start with your actual priorities.",
      ],
      [
        "Discuss a suitable visit frequency",
        "Weekly or fortnightly requests can be discussed for regular care. A one-off visit may suit a specific refresh. Availability and the final scope need confirmation.",
      ],
      [
        "Review the checklist as life changes",
        "Tell the team when room use, access or priorities change. Agree any extra tasks and quote adjustments before the next visit rather than assuming the same scope suits every situation.",
      ],
    ],
  },
  {
    slug: "residential-window-cleaning-tips",
    title: "Window Care Tips for Residential Properties",
    category: "Home care",
    image: "/images/about-window-male.webp",
    imageAlt: "Cleaner polishing an interior window frame in a home",
    read: "3 min read",
    intro:
      "Simple preparation notes for accessible glass and window ledges at home.",
    sections: [
      [
        "Keep internal ledges accessible",
        "Remove loose belongings from sills and identify fragile items. Share any surface-care instructions for timber, painted frames or other delicate finishes.",
      ],
      [
        "Describe the glass and access",
        "Note which panes and frames need attention and whether they can be reached from inside the home. Do not assume exterior or high-access work can be included.",
      ],
      [
        "Confirm optional tasks",
        "Discuss reachable glass and frame care alongside your residential cleaning request. The agreed checklist confirms any extra tasks and their limits.",
      ],
    ],
  },
];

export const articles = articleCatalogue.filter(
  (article) =>
    ![
      "moving-out-cleaning-checklist",
      "prepare-home-move-in-clean",
      "balcony-patio-cleaning-checklist",
    ].includes(article.slug),
);
