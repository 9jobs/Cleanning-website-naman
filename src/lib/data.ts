import { servicePages } from "./service-pages";

const serviceSummaries: Record<string, string> = {
  "house-cleaning": "Everyday home care, planned around your routine.",
  "property-cleaning":
    "A fresh start for rentals, vacant and managed properties.",
  "garden-cleaning": "A tidy-up for patios, paths and outdoor areas.",
  "construction-cleaning":
    "Dust and surface cleaning after building or renovation work.",
  "end-of-lease-cleaning":
    "Move-out cleaning with a property-specific checklist.",
  "commercial-cleaning":
    "Practical cleaning for workplaces and shared business spaces.",
  "office-cleaning": "Care for desks, meeting rooms and shared office areas.",
  "airbnb-cleaning": "Cleaning support between short-stay guest visits.",
  "carpet-cleaning": "Carpet care tailored to its fibres and condition.",
  "window-cleaning": "A clearer outlook for safely accessible windows.",
  "oven-cleaning": "Detailed care for your oven and agreed components.",
};

const serviceThumbnails: Record<string, string> = {
  "house-cleaning": "house",
  "property-cleaning": "property",
  "garden-cleaning": "garden",
  "construction-cleaning": "construction",
  "end-of-lease-cleaning": "lease",
  "commercial-cleaning": "commercial-male",
  "office-cleaning": "office",
  "airbnb-cleaning": "airbnb",
  "carpet-cleaning": "carpet",
  "window-cleaning": "window-male",
  "oven-cleaning": "oven",
};

const catalogue = [
  ["house-cleaning", "House Cleaning", "Residential"],
  ["property-cleaning", "Property Cleaning", "Residential"],
  ["garden-cleaning", "Garden Cleaning", "Residential"],
  ["construction-cleaning", "Construction Cleaning", "Commercial"],
  ["commercial-cleaning", "Commercial Cleaning", "Commercial"],
  ["office-cleaning", "Office Cleaning", "Commercial"],
  ["airbnb-cleaning", "Airbnb Cleaning", "Commercial"],
  ["carpet-cleaning", "Carpet Cleaning", "Specialist"],
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

export const faqs = [
  {
    category: "Services",
    q: "What types of cleaning services do you provide?",
    a: "Thrive4 offers House, Property, Garden, Construction, Commercial, Office, Airbnb and Carpet Cleaning. Share the property and work required so suitability and scope can be confirmed.",
  },
  {
    category: "Services",
    q: "Do you provide house and property cleaning?",
    a: "Yes. House Cleaning supports routine or one-off home care. Property Cleaning is discussed for rental, vacant and managed residential properties with a property-specific checklist.",
  },
  {
    category: "Services",
    q: "Can I request garden or outdoor cleaning?",
    a: "Yes. Describe the garden, patio, balcony or path, including surface types, access and any loose leaves or light debris. Tasks and debris handling are agreed in advance.",
  },
  {
    category: "Services",
    q: "What is included in construction cleaning?",
    a: "The agreed scope can cover ordinary settled dust, light debris, accessible surfaces and finished floors after building or renovation work. Hazardous material handling, heavy waste disposal and specialist regulated work are not confirmed services.",
  },
  {
    category: "Booking",
    q: "Can I request a one-off clean?",
    a: "Yes. A single visit can be requested for the relevant service. Describe your priorities, property condition and preferred timing; no appointment is confirmed until the team agrees the arrangements.",
  },
  {
    category: "Pricing",
    q: "How is pricing calculated?",
    a: "The quote depends on the property or area, its condition, access, service scope and agreed extras. Existing published plan information is a guide; the team confirms the written quote for your requirements.",
  },
  {
    category: "Services",
    q: "Do you provide cleaning for commercial properties?",
    a: "Commercial Cleaning covers enquiries for workplaces, offices, retail and communal spaces. Explain the premises, shared facilities and operating requirements so a suitable scope can be discussed.",
  },
  {
    category: "Services",
    q: "Can I add carpet cleaning?",
    a: "Carpet cleaning can be requested separately or discussed alongside a relevant property clean. Surface condition, equipment and access affect what can be agreed.",
  },
  {
    category: "Booking",
    q: "How do I request a quote?",
    a: "Choose a service and share your location, property type, size, current condition and priority tasks through the quote or contact form. The team reviews scope and availability before confirming arrangements.",
  },
  {
    category: "Areas",
    q: "Do you clean in my suburb?",
    a: "Share your suburb and postcode with the team so local availability can be confirmed. No Australia-wide availability is promised.",
  },
];

export const articles = [
  {
    slug: "a-calm-weekly-cleaning-routine",
    title: "House Cleaning Checklist for Busy Homes",
    category: "Home care",
    image: "/images/journal-house-male.webp",
    read: "3 min read",
    intro:
      "A practical checklist for keeping priority rooms ready for everyday living.",
    sections: [
      [
        "Start with the rooms you use most",
        "List kitchen surfaces, bathrooms, bedrooms and living areas. Identify accessible tasks that fit your routine and note areas needing additional attention.",
      ],
      [
        "Plan the surfaces and floors",
        "Clear loose belongings before cleaning. Follow care instructions for the actual finishes in your home and leave delicate or uncertain surfaces for discussion.",
      ],
      [
        "Decide on routine or one-off support",
        "House Cleaning can be requested as ongoing upkeep or a single visit. Share room numbers, pets, access and priorities when discussing a cleaning scope.",
      ],
    ],
  },
  {
    slug: "moving-out-cleaning-checklist",
    title: "Preparing a Rental Property for End of Lease Cleaning",
    category: "Property care",
    image: "/images/journal-lease-male.webp",
    read: "3 min read",
    intro:
      "Organise access, empty storage and a room-by-room checklist before the property handover.",
    sections: [
      [
        "Gather the property checklist",
        "Share your condition report and agent checklist so the cleaning request can be reviewed against the property requirements.",
      ],
      [
        "Arrange an empty space",
        "Remove belongings and empty cupboards and wardrobes intended for cleaning. Tell the team about anything that will remain.",
      ],
      [
        "Discuss additional work early",
        "Carpet, window and oven cleaning can be requested separately. Scope and timing must be confirmed; cleaning does not guarantee a bond return.",
      ],
    ],
  },
  {
    slug: "garden-outdoor-cleaning-checklist",
    title: "Garden & Outdoor Cleaning Checklist",
    category: "Outdoor care",
    image: "/images/journal-garden.webp",
    read: "3 min read",
    intro:
      "Plan a tidy-up of patios, balconies, garden paths and accessible outdoor areas.",
    sections: [
      [
        "Walk around the outdoor area",
        "Note surface types, steps, gates and the locations of loose leaves, ordinary dirt or small fallen twigs. Photographs help explain the work.",
      ],
      [
        "Define the tidy-up",
        "Identify the areas to sweep or clean and any delicate plants or finishes. Do not assume landscaping, tree work or specialist waste handling is included.",
      ],
      [
        "Agree access and debris handling",
        "Discuss how the team can enter and what will happen to light debris. Confirm suitable tasks, scope and availability before arranging a visit.",
      ],
    ],
  },
  {
    slug: "post-construction-cleaning-scope",
    title: "Post-Construction Cleaning: What Should Be Included?",
    category: "Construction care",
    image: "/images/journal-construction-male.webp",
    read: "3 min read",
    intro:
      "Understand the information needed to plan cleaning after completed building work.",
    sections: [
      [
        "Confirm the site is ready",
        "Tell the team whether trades have finished and which areas have been released for cleaning. Identify access restrictions and new finishes.",
      ],
      [
        "List ordinary dust and light residue",
        "Describe settled dust, accessible surfaces and floor-cleaning requirements. Share photos and builder instructions for the materials installed.",
      ],
      [
        "Make the boundaries clear",
        "Hazardous material handling and heavy construction waste disposal are not confirmed services. Identify uncertain residue and agree a suitable cleaning scope before work begins.",
      ],
    ],
  },
  {
    slug: "prepare-property-after-renovation",
    title: "How to Prepare a Property After Renovation Work",
    category: "Property care",
    image: "/images/journal-renovation-male.webp",
    read: "3 min read",
    intro:
      "Bring together finish details, access instructions and cleaning priorities after a renovation.",
    sections: [
      [
        "Document the completed work",
        "Describe the rooms renovated, installed finishes and any remaining light residue. Keep manufacturer care information available.",
      ],
      [
        "Coordinate access",
        "Confirm trades have finished and arrange a site contact, parking and entry instructions. Mention any areas that should remain untouched.",
      ],
      [
        "Request a written scope",
        "Discuss Construction Cleaning for post-work dust and presentation tasks, or Property Cleaning for a wider property checklist. The team confirms suitability and timing.",
      ],
    ],
  },
  {
    slug: "commercial-workplace-cleaning-checklist",
    title: "Commercial Cleaning Checklist for Workplaces",
    category: "Workplace care",
    image: "/images/journal-commercial.webp",
    read: "3 min read",
    intro:
      "A practical starting point for discussing cleaning across shared business premises.",
    sections: [
      [
        "Map the shared areas",
        "List workstations, customer areas, staff kitchens, communal facilities and floor surfaces that form part of your premises.",
      ],
      [
        "Explain the working day",
        "Share operating hours, a site contact and preferred visit windows. Identify restricted rooms, equipment and entry procedures.",
      ],
      [
        "Agree the tasks",
        "Discuss accessible surfaces, floors and ordinary waste bins. The written scope should clarify the areas, frequency and access arrangements confirmed for the site.",
      ],
    ],
  },
  {
    slug: "carpet-care-after-building-work",
    title: "Carpet Care After Renovation or Construction",
    category: "Specialist care",
    image: "/images/journal-carpet-male.webp",
    read: "3 min read",
    intro:
      "Describe carpet condition and recent work before discussing suitable cleaning care.",
    sections: [
      [
        "Describe the fibres and condition",
        "Share the carpet type if known, visible wear, dust and any stains. Explain the renovation work and previous treatments.",
      ],
      [
        "Identify residue before cleaning",
        "Tell the team about unknown residue or material left by trades. Do not assume specialist or hazardous material treatment is included.",
      ],
      [
        "Discuss method and aftercare",
        "The cleaning approach and drying advice depend on the carpet and conditions. Complete stain removal and fixed drying times cannot be promised.",
      ],
    ],
  },
  {
    slug: "residential-window-cleaning-tips",
    title: "Window Cleaning Tips for Residential Properties",
    category: "Specialist care",
    image: "/images/journal-window-male.webp",
    read: "3 min read",
    intro:
      "Prepare a clear window-cleaning enquiry with pane numbers, height and access information.",
    sections: [
      [
        "Count and describe the panes",
        "Note approximate sizes, opening styles, screens and visible condition. Photos can make the requested scope easier to review.",
      ],
      [
        "Prepare accessible areas",
        "Clear items from internal sills and identify obstacles, locks and existing damage. Discuss which glass, tracks and frames are to be included.",
      ],
      [
        "Confirm exterior suitability",
        "Exterior panes depend on access and site conditions. High-rise, rope-access and specialist access capabilities are not confirmed; ask before making arrangements.",
      ],
    ],
  },
];
