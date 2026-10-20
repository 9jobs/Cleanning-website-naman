export const serviceGuides: Record<
  string,
  {
    audience: string;
    preparation: string;
    focus: string;
    questions: [string, string][];
  }
> = {
  "regular-house-cleaning": {
    audience:
      "For households that want a dependable routine for the rooms used every day. Agree the rooms and priorities, then request a weekly, fortnightly or monthly visit.",
    preparation:
      "Clear loose items from floors and benchtops, and share pet or access instructions. Tell us which rooms matter most so the agreed visit can focus on the right tasks.",
    focus: "A steady rhythm for your home",
    questions: [
      [
        "Can I request a regular cleaning frequency?",
        "Choose weekly, fortnightly or monthly in the request form. The actual visit schedule depends on coverage and availability, and is confirmed by the team.",
      ],
      [
        "Does regular cleaning include appliance interiors?",
        "Routine exterior surfaces are part of the agreed checklist. Oven, fridge and other appliance interiors are optional extras to discuss before the visit.",
      ],
    ],
  },
  "deep-cleaning": {
    audience:
      "For a seasonal reset, overlooked surfaces or a home that needs more attention than routine upkeep. Share the areas with built-up grime so the scope can be assessed properly.",
    preparation:
      "Describe the areas needing detailed work, clear accessible surfaces and flag delicate materials. Heavy build-up or specialist surfaces may need extra time or a separate assessment.",
    focus: "More attention to the overlooked details",
    questions: [
      [
        "How is a deep clean different from regular upkeep?",
        "A deep clean allows for more detailed work on agreed surfaces, fixtures and built-up grime. The checklist and time required depend on the property's condition.",
      ],
      [
        "Can I choose which areas need the most attention?",
        "Yes. Tell us about priority rooms, skirting boards, splashbacks or other concerns when requesting a quote. The final written scope sets out what can be included.",
      ],
    ],
  },
  "end-of-lease-cleaning": {
    audience:
      "For tenants, landlords and property managers preparing an empty property for handover. Start with the condition report and any supplied agent checklist.",
    preparation:
      "Confirm when furniture and belongings will be removed, share the handover deadline and arrange access to electricity and water. Provide your agent's checklist before the scope is agreed.",
    focus: "A clearer plan for moving day",
    questions: [
      [
        "Should the property be empty for the clean?",
        "An empty property provides access to cupboards, floors and wardrobes. Share your removal and key-return dates so the team can assess a suitable cleaning window.",
      ],
      [
        "Is a bond return guaranteed?",
        "No. Bond decisions depend on the lease, property condition and the property manager's assessment. The cleaning visit follows an agreed scope; it does not guarantee a bond outcome.",
      ],
    ],
  },
  "commercial-cleaning": {
    audience:
      "For shared workplaces, customer-facing premises and commercial common areas. The plan is based on how the space is used, its floor area and your operational priorities.",
    preparation:
      "Share the approximate floor area, access arrangements, operating hours and high-use areas. Flag secure rooms, sensitive equipment and any site-specific safety requirements.",
    focus: "Practical care around your working day",
    questions: [
      [
        "Can the plan include common areas and staff facilities?",
        "Yes. Describe kitchens, restrooms, reception spaces and shared work areas so these can be considered in the written checklist.",
      ],
      [
        "Can I request a visit outside business hours?",
        "Include preferred access times in your enquiry. After-hours arrangements depend on site access and team availability and must be confirmed directly.",
      ],
    ],
  },
  "airbnb-cleaning": {
    audience:
      "For short-stay hosts and property managers planning changeovers between guests. Share the property layout and check-in window so the team can assess the required turnaround.",
    preparation:
      "Provide check-out and check-in windows, key access details, linen arrangements and your room checklist. Explain how supplies should be handled; linen or restocking services must be agreed separately.",
    focus: "A considered reset between stays",
    questions: [
      [
        "Can you work around guest changeovers?",
        "Share your turnaround window when requesting a visit. A preferred check-in deadline is not a confirmed booking; the team must confirm whether the schedule can be met.",
      ],
      [
        "Are linen and restocking included?",
        "Tell us how linen, towels and consumables are managed. These arrangements are property-specific and are included only when agreed in the written scope.",
      ],
    ],
  },
  "carpet-cleaning": {
    audience:
      "For carpeted rooms, high-traffic areas and fibres that need specialist attention. Treatment depends on the carpet material, wear, existing stains and access.",
    preparation:
      "Share the carpeted area, known fibre type and any previous stain treatments. Clear small loose items and ask which furniture can safely stay in place during treatment.",
    focus: "The right method for your carpet",
    questions: [
      [
        "Can every carpet stain be removed?",
        "No. Results depend on the fibre, age of the stain, previous treatments and existing damage. The team assesses the material and explains treatment limitations.",
      ],
      [
        "How long should I allow for drying?",
        "Drying varies with the selected method, ventilation, material and weather. Follow the specific aftercare and access guidance provided for your clean.",
      ],
    ],
  },
  "one-off-cleaning": {
    audience:
      "For a fresh start before an event, after a busy period or whenever the home needs a single-visit refresh. No recurring schedule is needed to make an enquiry.",
    preparation:
      "Choose the rooms and tasks that matter most, explain the current condition and share any event or access timing. Optional appliance and window work should be requested upfront.",
    focus: "A fresh start without a recurring plan",
    questions: [
      [
        "Do I have to book recurring visits?",
        "No. One-off cleaning is a single-visit request. If you later want regular upkeep, you can discuss a separate ongoing plan.",
      ],
      [
        "Can I request a clean before an event?",
        "Share the event date and the time the space needs to be ready. The team will confirm whether the requested visit can be arranged.",
      ],
    ],
  },
  "residential-cleaning": {
    audience:
      "For houses, apartments and townhouses with their own routines, layouts and surface-care needs. Build the checklist around your household rather than a generic room count alone.",
    preparation:
      "Tell us about stairs, parking, pets, preferred products and delicate finishes. Make priority areas accessible and identify any rooms or belongings that should be left untouched.",
    focus: "Care shaped around your household",
    questions: [
      [
        "Can the checklist suit an apartment or townhouse?",
        "Yes. Include your property type, layout and access details in the request. The scope can then be matched to the rooms and surfaces you want cleaned.",
      ],
      [
        "What if I have delicate surfaces?",
        "Flag natural stone, timber, specialist finishes or manufacturer care instructions before the visit so appropriate methods can be discussed.",
      ],
    ],
  },
  "office-cleaning": {
    audience:
      "For offices that need clear desks, welcoming reception areas and well-maintained shared facilities. Tell us about occupancy, room use and the practicalities of accessing your workplace.",
    preparation:
      "Provide access and alarm instructions securely, identify restricted areas and ask staff to clear personal paperwork from desks. Sensitive electronics and specialist equipment require an agreed scope.",
    focus: "A clearer workspace for the next day",
    questions: [
      [
        "Do cleaners move paperwork or handle computers?",
        "Clear desk surfaces before the visit and identify sensitive equipment. Handling paperwork or specialist electronics is not assumed to be included.",
      ],
      [
        "Can the plan cover meeting rooms and reception?",
        "Yes. List your meeting rooms, reception, staff kitchen and restroom needs so they can be assessed alongside the main work areas.",
      ],
    ],
  },
  "window-cleaning": {
    audience:
      "For accessible windows, glass and frames that need a clearer finish. Quote details should include approximate window numbers, size, access and the height of external glass.",
    preparation:
      "Share access limitations, window height, screens, tracks and any existing scratches or damaged seals. High-access or specialist work needs a separate assessment before it can be agreed.",
    focus: "Clear glass, carefully considered access",
    questions: [
      [
        "Are high or difficult-to-reach windows included?",
        "Not automatically. Window height and safe access must be assessed. Tell us about ladders, roof access or other constraints before requesting the scope.",
      ],
      [
        "Can tracks, frames and screens be included?",
        "List these details in your enquiry. Glass, tracks, frames and screens can require different work and are included only when stated in the agreed checklist.",
      ],
    ],
  },
  "oven-cleaning": {
    audience:
      "For built-up grease on compatible ovens, racks and door glass. The approach depends on appliance type, condition and manufacturer care requirements.",
    preparation:
      "Tell us the oven type and any faults, arrange safe access and let the appliance cool before the visit. Flag self-cleaning coatings or manufacturer restrictions in advance.",
    focus: "Detailed care for a hard-working appliance",
    questions: [
      [
        "Does oven cleaning include repairs?",
        "No. This is a cleaning service, not an appliance repair or electrical service. Existing faults or damaged components should be assessed by a suitable technician.",
      ],
      [
        "Can every oven coating be cleaned the same way?",
        "No. Self-cleaning liners, specialist coatings and appliance components need care appropriate to the manufacturer guidance. Share these details when requesting a quote.",
      ],
    ],
  },
};
