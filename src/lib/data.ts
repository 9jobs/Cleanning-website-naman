import { servicePages } from "./service-pages";

const serviceSummaries: Record<string, string> = {
  "house-cleaning": "Everyday home care, planned around your routine.",
  "one-off-cleaning":
    "A single-visit House Cleaning request for priority rooms.",
  "property-cleaning":
    "A fresh start for rentals, vacant and managed properties.",
  "construction-cleaning":
    "Dust and surface cleaning after building or renovation work.",
  "end-of-lease-cleaning":
    "Move-out cleaning with a property-specific checklist.",
  "commercial-cleaning":
    "Practical cleaning for workplaces and shared business spaces.",
  "office-cleaning": "Care for desks, meeting rooms and shared office areas.",
  "airbnb-cleaning": "Cleaning support between short-stay guest visits.",
  "window-cleaning": "A clearer outlook for safely accessible windows.",
  "oven-cleaning": "Detailed care for your oven and agreed components.",
};

const serviceThumbnails: Record<string, string> = {
  "house-cleaning": "house",
  "property-cleaning": "property",
  "one-off-cleaning": "house",
  "construction-cleaning": "construction",
  "end-of-lease-cleaning": "lease",
  "commercial-cleaning": "commercial-male",
  "office-cleaning": "office",
  "airbnb-cleaning": "airbnb",
  "window-cleaning": "window-male",
  "oven-cleaning": "oven",
};

const catalogue = [
  ["house-cleaning", "House Cleaning", "Residential"],
  ["one-off-cleaning", "One-Off Cleaning", "Residential"],
  ["property-cleaning", "Property Cleaning", "Residential"],
  ["construction-cleaning", "Construction Cleaning", "Commercial"],
  ["commercial-cleaning", "Commercial Cleaning", "Commercial"],
  ["office-cleaning", "Office Cleaning", "Commercial"],
  ["airbnb-cleaning", "Airbnb Cleaning", "Commercial"],
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
    a: "Thrive4 offers House, One-Off, Property, Commercial, Office, Construction and Airbnb Cleaning. Share the property and work required so suitability and scope can be confirmed.",
  },
  {
    category: "Services",
    q: "Do you provide house and property cleaning?",
    a: "Yes. House Cleaning supports routine or one-off home care. Property Cleaning is discussed for rental, vacant and managed residential properties with a property-specific checklist.",
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
        "Discuss priority rooms, appliance detailing and handover timing with the team. Scope and timing must be confirmed; cleaning does not guarantee a bond return.",
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
