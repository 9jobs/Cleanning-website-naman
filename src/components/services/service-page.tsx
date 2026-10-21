import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Check,
  House,
  Sparkles,
  ClipboardList,
  KeyRound,
  Building2,
  Armchair,
  Bath,
  CookingPot,
  Sun,
  Layers3,
  Clock3,
  ChevronRight,
} from "lucide-react";
import { services } from "@/lib/data";
import {
  servicePages,
  type ServicePageContent,
  type ServiceArea,
} from "@/lib/service-pages";
import { Reveal } from "@/components/motion";
import { RoomTabs, ServiceFAQs, ServiceDirectory } from "./interactions";
import styles from "./services.module.css";

type Service = (typeof services)[number];
function Photo({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`${styles.photo} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={
          className === styles.heroBackdrop
            ? "100vw"
            : "(max-width: 767px) 100vw, (max-width: 1440px) 65vw, 1100px"
        }
      />
    </div>
  );
}
function Intro({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <Reveal className={styles.sectionIntro} distance={24} duration={0.45}>
      <span className={styles.kicker}>{label}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </Reveal>
  );
}
function Action({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`${styles.button} ${secondary ? styles.secondary : ""}`}
    >
      {children}
      <ArrowRight size={18} aria-hidden="true" />
    </Link>
  );
}
function Breadcrumb({ name }: { name?: string }) {
  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <Link href="/">Home</Link>
      <ChevronRight size={12} aria-hidden="true" />
      {name ? (
        <>
          <Link href="/services">Services</Link>
          <ChevronRight size={12} aria-hidden="true" />
          <span aria-current="page">{name}</span>
        </>
      ) : (
        <span aria-current="page">Services</span>
      )}
    </nav>
  );
}
function Checks({ items }: { items: string[] }) {
  return (
    <ul className={styles.checks}>
      {items.map((item) => (
        <li key={item}>
          <Check size={18} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
function AreaCards({ areas }: { areas: ServiceArea[] }) {
  return (
    <div className={styles.areaCards}>
      {areas.map((area, i) => {
        const Icon = /kitchen|staff/i.test(area.title)
          ? CookingPot
          : /bathroom/i.test(area.title)
            ? Bath
            : /floor/i.test(area.title)
              ? Layers3
              : /shared/i.test(area.title)
                ? Building2
                : Armchair;
        return (
          <Reveal
            key={area.title}
            distance={24}
            duration={0.45}
            delay={i * 0.06}
            className={styles.stretch}
          >
            <article className={styles.areaCard}>
              <span className={styles.icon}>
                <Icon size={25} aria-hidden="true" />
              </span>
              <h3>{area.title}</h3>
              <Checks items={area.items} />
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}
function Preparation({
  text,
  title = "Before your visit",
}: {
  text: string;
  title?: string;
}) {
  return (
    <aside className={styles.preparation}>
      <span className={styles.icon}>
        <ClipboardList size={26} aria-hidden="true" />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </aside>
  );
}
function Details({
  data,
  title = "A few details make a better plan.",
}: {
  data: ServicePageContent;
  title?: string;
}) {
  return (
    <div className={styles.details}>
      <Intro label="WHAT TO TELL US" title={title} />
      <Checks items={data.details} />
    </div>
  );
}
function Process({
  data,
  vertical = false,
}: {
  data: ServicePageContent;
  vertical?: boolean;
}) {
  return (
    <ol className={`${styles.process} ${vertical ? styles.vertical : ""}`}>
      {data.steps.map(([title, text], i) => (
        <li key={title}>
          <Reveal distance={20} duration={0.45} delay={i * 0.08}>
            <span className={styles.stepNumber}>0{i + 1}</span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}
function Section({
  children,
  sage = false,
  className = "",
  id,
}: {
  children: ReactNode;
  sage?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`${styles.section} ${sage ? styles.sage : ""} ${className}`}
    >
      <div className={styles.container}>{children}</div>
    </section>
  );
}
function Extras({ slug, oven = true }: { slug: string; oven?: boolean }) {
  const extras = (
    slug === "garden-cleaning"
      ? ["property-cleaning", "carpet-cleaning", "construction-cleaning"]
      : ["carpet-cleaning", "property-cleaning", "garden-cleaning"]
  )
    .filter((key) => key !== slug)
    .map((key) => {
      const service = services.find((item) => item.slug === key)!;
      return [key, service.name, service.summary];
    });
  return (
    <div className={styles.extrasLayout}>
      <div>
        <Intro
          label="BY PRIOR ARRANGEMENT"
          title={
            slug === "garden-cleaning"
              ? "Care around the wider property."
              : "Make the scope your own."
          }
        >
          Optional work is agreed separately.
          {oven &&
            slug !== "garden-cleaning" &&
            " Fridge detailing can also be discussed with the team. For a wider property checklist, explore Property Cleaning."}
        </Intro>
        <Link href={`/contact?service=${slug}`} className={styles.textLink}>
          {slug === "garden-cleaning"
            ? "Discuss the outdoor scope"
            : "Discuss your extras"}{" "}
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
      <div className={styles.extras}>
        {extras.map(([key, title, text]) => (
          <Link key={key} href={`/services/${key}`}>
            <Photo src={servicePages[key].image} alt={servicePages[key].alt} />
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
              <ArrowRight size={18} aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Hero({
  service,
  data,
}: {
  service: Service;
  data: ServicePageContent;
}) {
  const slug = service.slug;
  const cover = [
    "house-cleaning",
    "property-cleaning",
    "commercial-cleaning",
    "carpet-cleaning",
    "window-cleaning",
  ].includes(slug);
  return (
    <section
      className={`${styles.hero} ${cover ? styles.coverHero : styles.splitHero}`}
    >
      {cover && (
        <Photo
          src={data.image}
          alt={data.alt}
          priority
          className={styles.heroBackdrop}
        />
      )}
      <div className={styles.container}>
        <Breadcrumb name={service.name} />
        <div className={styles.heroLayout}>
          <Reveal distance={24} duration={0.55} className={styles.heroCopy}>
            <span className={styles.kicker}>{data.label}</span>
            <h1>{service.name}</h1>
            <p className={styles.heroLead}>{data.lead}</p>
            <p className={styles.heroDescription}>
              {slug === "house-cleaning"
                ? "Dependable routine care for kitchens, bathrooms and everyday living spaces. Tell us what a fresh home looks like for you."
                : data.description}
            </p>
            <div className={styles.actions}>
              <Action href={`/book?service=${slug}`}>Request a Clean</Action>
              <Action href={`/contact?service=${slug}`} secondary>
                Get a Free Quote
              </Action>
            </div>
            <Link href="#cleaning-scope" className={styles.heroAnchor}>
              Explore the cleaning scope <span aria-hidden="true">↓</span>
            </Link>
          </Reveal>
          {!cover && (
            <Reveal
              variant="right"
              distance={24}
              duration={0.55}
              className={styles.heroVisual}
            >
              <Photo src={data.image} alt={data.alt} priority />
              {slug === "airbnb-cleaning" && (
                <Photo
                  src={data.supportImage}
                  alt={data.supportAlt}
                  className={styles.collageInset}
                />
              )}
              {slug === "office-cleaning" && (
                <span className={styles.photoCaption}>
                  <Building2 size={18} aria-hidden="true" /> Workstations.
                  Shared spaces. Everyday care.
                </span>
              )}
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

function Regular({ data, slug }: { data: ServicePageContent; slug: string }) {
  return (
    <>
      <Section>
        <div className={styles.regularIntro}>
          <Photo src={data.supportImage} alt={data.supportAlt} />
          <Reveal variant="up" distance={24} duration={0.5}>
            <Intro label="THE THRIVE4 APPROACH" title={data.heading}>
              {data.description}
            </Intro>
          </Reveal>
          <Preparation text={data.preparation} />
        </div>
      </Section>
      <Section sage id="cleaning-scope">
        <div className={styles.headingRow}>
          <Intro
            label="THE AREAS WE CARE FOR"
            title="What your house clean can include."
          />
          <p>
            Room-based care for the accessible areas of your home. Your agreed
            checklist confirms the tasks for each visit.
          </p>
        </div>
        <AreaCards areas={data.areas} />
      </Section>
      <Section>
        <Extras slug={slug} />
      </Section>
      <Section sage>
        <Intro
          label="A CLEAR WAY TO GET STARTED"
          title="Three steps towards a fresher space."
        />
        <Process data={data} />
      </Section>
      <Section>
        <Details data={data} />
      </Section>
    </>
  );
}
function Deep({ data }: { data: ServicePageContent }) {
  return (
    <>
      <Section>
        <div className={styles.deepIntro}>
          <Intro
            label="RENTAL, VACANT & MANAGED PROPERTIES"
            title={data.heading}
          >
            {data.description}
          </Intro>
          <div className={styles.moments}>
            {[
              "Rental properties",
              "Vacant properties",
              "Managed properties",
            ].map((text, i) => (
              <div key={text}>
                <span>0{i + 1}</span>
                <h3>{text}</h3>
              </div>
            ))}
          </div>
        </div>
      </Section>
      <Section sage id="cleaning-scope">
        <div className={styles.tabLayout}>
          <div>
            <Intro
              label="DETAIL BY DETAIL"
              title="Choose an area. See the focus."
            />
            <Photo src={data.supportImage} alt={data.supportAlt} />
          </div>
          <RoomTabs areas={data.areas} />
        </div>
      </Section>
      <Section>
        <div className={styles.twoColumns}>
          <Preparation
            text={data.preparation}
            title="Help us reach the details"
          />
          <Details data={data} />
        </div>
      </Section>
      <Section sage>
        <Intro
          label="YOUR PROPERTY CLEAN, PLANNED"
          title="From condition to clear scope."
        />
        <Process data={data} />
      </Section>
    </>
  );
}
function Lease({ data, slug }: { data: ServicePageContent; slug: string }) {
  return (
    <>
      <Section sage id="cleaning-scope">
        <div className={styles.leaseChecklist}>
          <div>
            <Intro label="MOVE-OUT, ROOM BY ROOM" title={data.heading}>
              {data.description}
            </Intro>
            <Link href="#property-details" className={styles.textLink}>
              Plan the property details{" "}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.checklistRows}>
            {data.areas.map((area, i) => (
              <article key={area.title}>
                <span className={styles.number}>0{i + 1}</span>
                <div>
                  <h3>{area.title}</h3>
                  <Checks items={area.items} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>
      <Section id="property-details">
        <div className={styles.twoColumns}>
          <Photo src={data.supportImage} alt={data.supportAlt} />
          <div>
            <Details data={data} />
            <Preparation
              text={data.preparation}
              title="Empty rooms. Clear access."
            />
          </div>
        </div>
      </Section>
      <Section sage>
        <Extras slug={slug} oven={false} />
      </Section>
      <Section>
        <Intro
          label="FROM ENQUIRY TO CONFIRMATION"
          title="A practical plan for moving day."
        />
        <Process data={data} />
        <p className={styles.scopeNote}>
          Cleaning is agreed to a written scope. Inspection approval and bond
          decisions remain with the agent or landlord.
        </p>
      </Section>
    </>
  );
}
function Commercial({ data }: { data: ServicePageContent }) {
  return (
    <>
      <Section>
        <div className={styles.headingRow}>
          <Intro label="BUSINESS PREMISES" title={data.heading} />
          <p>{data.description}</p>
        </div>
        <div className={styles.businessTypes}>
          {[
            ["Offices", Building2],
            ["Retail spaces", House],
            ["Communal facilities", Layers3],
            ["Shared workplaces", Armchair],
          ].map(([label, Icon]) => {
            const TileIcon = Icon as typeof House;
            return (
              <div key={String(label)}>
                <TileIcon size={30} aria-hidden="true" />
                <h3>{String(label)}</h3>
              </div>
            );
          })}
        </div>
      </Section>
      <Section sage id="cleaning-scope">
        <div className={styles.businessScope}>
          <Intro
            label="A SCOPE THAT WORKS ON SITE"
            title="Focus on the spaces your people share."
          />
          <AreaCards areas={data.areas} />
        </div>
      </Section>
      <Section>
        <div className={styles.twoColumns}>
          <Photo src={data.supportImage} alt={data.supportAlt} />
          <div>
            <Details data={data} />
            <Preparation
              text={data.preparation}
              title="Scheduling & site access"
            />
          </div>
        </div>
      </Section>
      <Section sage>
        <div className={styles.timelineLayout}>
          <Intro
            label="LET’S UNDERSTAND YOUR BUSINESS"
            title="Start with the site, then the schedule."
          />
          <Process data={data} vertical />
        </div>
      </Section>
    </>
  );
}
function Airbnb({ data }: { data: ServicePageContent }) {
  return (
    <>
      <Section>
        <div className={styles.hospitalityIntro}>
          <Intro label="BETWEEN ONE STAY AND THE NEXT" title={data.heading}>
            {data.description}
          </Intro>
          <aside className={styles.smallNote}>
            <KeyRound size={25} aria-hidden="true" />
            <h3>Your property instructions matter.</h3>
            <p>
              Share how you want rooms presented, what guests have used and
              where the team can find essential access information.
            </p>
          </aside>
        </div>
      </Section>
      <Section sage id="cleaning-scope">
        <Intro
          label="GUEST-FACING ROOMS"
          title="A considered changeover checklist."
        />
        <AreaCards areas={data.areas} />
      </Section>
      <Section>
        <div className={styles.twoColumns}>
          <div>
            <Intro
              label="PREPARE THE TURNOVER"
              title="A clear handover helps everyone."
            />
            <Process data={data} vertical />
          </div>
          <div className={styles.instructionPanel}>
            <Details data={data} />
            <Preparation
              text={data.preparation}
              title="Timing is agreed in advance"
            />
            <p className={styles.scopeNote}>
              Linen, laundry and restocking require prior agreement. Supply and
              same-day availability are not assumed.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
function Carpet({ data }: { data: ServicePageContent }) {
  return (
    <>
      <Section>
        <div className={styles.twoColumns}>
          <Intro label="LOOK AT THE CONDITION FIRST" title={data.heading}>
            {data.description}
          </Intro>
          <Details
            data={data}
            title="Tell us about the fibres, not just the floor area."
          />
        </div>
      </Section>
      <Section sage id="cleaning-scope">
        <div className={styles.carpetProcess}>
          <Photo src={data.supportImage} alt={data.supportAlt} />
          <div>
            <Intro label="A CAREFUL START" title="Inspect. Agree. Care." />
            <Process data={data} vertical />
          </div>
        </div>
      </Section>
      <Section>
        <div className={styles.concerns}>
          {data.areas.map((area, i) => (
            <article key={area.title}>
              <span className={styles.number}>0{i + 1}</span>
              <h3>{area.title}</h3>
              <Checks items={area.items} />
            </article>
          ))}
        </div>
      </Section>
      <Section sage>
        <div className={styles.twoColumns}>
          <Preparation
            text={data.preparation}
            title="Prepare the carpeted areas"
          />
          <div>
            <Intro
              label="AFTER THE CLEAN"
              title="Follow the care advice for your carpet."
            >
              Drying and use of the room depend on the carpet, cleaning method
              and conditions. Ask the team for guidance before placing items
              back.
            </Intro>
            <p className={styles.scopeNote}>
              Complete stain removal and fixed drying times cannot be
              guaranteed.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
function OneOff({ data, slug }: { data: ServicePageContent; slug: string }) {
  return (
    <>
      <Section sage>
        <div className={styles.headingRow}>
          <Intro label="CARE FOR OUTDOOR SPACES" title={data.heading} />
          <p>{data.description}</p>
        </div>
        <div className={styles.occasionCards}>
          {[
            [
              "Patios & balconies",
              "Prepare accessible outdoor seating and floor areas.",
            ],
            [
              "Garden paths",
              "Discuss loose leaves, dirt and light debris on paths.",
            ],
            [
              "A planned tidy-up",
              "Agree the outdoor areas and debris handling before the visit.",
            ],
          ].map(([title, text], i) => (
            <article key={title}>
              <span className={styles.number}>0{i + 1}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </Section>
      <Section id="cleaning-scope">
        <div className={styles.priorityLayout}>
          <div>
            <Intro
              label="YOU SET THE PRIORITIES"
              title="Start with the outdoor areas that matter most."
            />
            <Preparation text={data.preparation} />
          </div>
          <div className={styles.priorityRooms}>
            {data.areas.map((area) => (
              <article key={area.title}>
                <h3>{area.title}</h3>
                <Checks items={area.items} />
              </article>
            ))}
          </div>
        </div>
      </Section>
      <Section sage>
        <Details data={data} />
      </Section>
      <Section>
        <Extras slug={slug} />
        <div className={styles.processDivider}>
          <Intro
            label="A SINGLE CLEANING REQUEST"
            title="A simple way to plan the visit."
          />
          <Process data={data} />
        </div>
      </Section>
    </>
  );
}
function Residential({ data }: { data: ServicePageContent }) {
  return (
    <>
      <Section>
        <div className={styles.homeTypes}>
          <Intro
            label="AFTER THE BUILDING WORK"
            title="New builds. Renovations. Handover."
          />
          <p>{data.description}</p>
          <div>
            <House size={36} aria-hidden="true" />
            <Building2 size={36} aria-hidden="true" />
            <Layers3 size={36} aria-hidden="true" />
          </div>
        </div>
      </Section>
      <Section sage id="cleaning-scope">
        <div className={styles.roomGuide}>
          <Photo src={data.supportImage} alt={data.supportAlt} />
          <div>
            <Intro
              label="FINISHED SURFACES, CLEAR SCOPE"
              title="Review the space after the final trade."
            />
            {data.areas.map((area, i) => (
              <article key={area.title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{area.title}</h3>
                  <Checks items={area.items} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>
      <Section>
        <Intro
          label="HOW IT WORKS"
          title="From completed work to an agreed clean."
        />
        <div className={styles.comparison}>
          {[
            [
              "/contact?service=construction-cleaning",
              "Describe the completed work",
              data.steps[0][1],
            ],
            [
              "#cleaning-scope",
              "Review the site requirements",
              data.steps[1][1],
            ],
            [
              "/book?service=construction-cleaning",
              "Agree the final clean",
              data.steps[2][1],
            ],
          ].map(([key, title, text]) => (
            <Link key={key} href={key}>
              <span className={styles.icon}>
                <House size={24} aria-hidden="true" />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
              <span className={styles.textLink}>
                View next step <ArrowRight size={18} aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </Section>
      <Section sage>
        <div className={styles.twoColumns}>
          <Details data={data} />
          <Preparation
            text={data.preparation}
            title="Your site, your requirements"
          />
        </div>
      </Section>
    </>
  );
}
function Office({ data }: { data: ServicePageContent }) {
  return (
    <>
      <Section id="cleaning-scope">
        <div className={styles.officeLayout}>
          <div className={styles.officeSide}>
            <Intro label="A STRUCTURED OFFICE CLEAN" title={data.heading}>
              {data.description}
            </Intro>
            <Link href="#office-requirements" className={styles.textLink}>
              Share your office requirements{" "}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className={styles.officeRows}>
            {data.areas.map((area, i) => (
              <article key={area.title}>
                <span className={styles.number}>0{i + 1}</span>
                <div>
                  <h3>{area.title}</h3>
                  <Checks items={area.items} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>
      <Section sage id="office-requirements">
        <div className={styles.twoColumns}>
          <Photo src={data.supportImage} alt={data.supportAlt} />
          <div>
            <Details data={data} title="Let’s understand your working day." />
            <Preparation
              text={data.preparation}
              title="Access, desks & documents"
            />
          </div>
        </div>
      </Section>
      <Section>
        <div className={styles.headingRow}>
          <Intro
            label="BEFORE THE FIRST VISIT"
            title="Agree the practical details together."
          />
          <span className={styles.icon}>
            <Clock3 size={25} aria-hidden="true" />
          </span>
        </div>
        <Process data={data} />
      </Section>
    </>
  );
}
function Windows({ data }: { data: ServicePageContent }) {
  return (
    <>
      <Section>
        <div className={styles.windowIntro}>
          <span className={styles.largeIcon}>
            <Sun size={50} strokeWidth={1.2} aria-hidden="true" />
          </span>
          <Intro label="BRIGHT SPACES, CLEAR SCOPE" title={data.heading}>
            {data.description}
          </Intro>
        </div>
      </Section>
      <Section id="cleaning-scope">
        <div className={styles.windowPanels}>
          {data.areas.slice(0, 2).map((area, i) => (
            <article key={area.title}>
              <span className={styles.number}>0{i + 1}</span>
              <h3>{area.title}</h3>
              <Checks items={area.items} />
              <p>
                {i === 0
                  ? "Confirm the panes, tracks and sills you would like included."
                  : "Exterior suitability depends on the site and safe access."}
              </p>
            </article>
          ))}
        </div>
      </Section>
      <Section sage>
        <div className={styles.twoColumns}>
          <Photo src={data.supportImage} alt={data.supportAlt} />
          <div>
            <Details
              data={data}
              title="The view is only part of the picture."
            />
            <Preparation
              text={data.preparation}
              title="Clear access to the glass"
            />
          </div>
        </div>
      </Section>
      <Section>
        <Intro
          label="FROM PANES TO PLAN"
          title="Make the access clear from the start."
        />
        <Process data={data} />
        <p className={styles.scopeNote}>
          High-rise, rope-access and specialist access capabilities are not
          confirmed. Discuss any difficult-access glass before making
          arrangements.
        </p>
      </Section>
    </>
  );
}
function Oven({ data }: { data: ServicePageContent }) {
  return (
    <>
      <Section id="cleaning-scope">
        <div className={styles.ovenScope}>
          <Intro label="INCLUSIONS & BOUNDARIES" title={data.heading}>
            {data.description}
          </Intro>
          <div className={styles.ovenColumns}>
            {data.areas.map((area, i) => (
              <article key={area.title} className={i ? styles.exclusions : ""}>
                <span className={styles.kicker}>
                  {i ? "NOT APPLIANCE REPAIR" : "SUBJECT TO YOUR APPLIANCE"}
                </span>
                <h3>{area.title}</h3>
                <Checks items={area.items} />
              </article>
            ))}
          </div>
        </div>
      </Section>
      <Section sage>
        <div className={styles.applianceBrief}>
          <div>
            <Intro
              label="KNOW YOUR APPLIANCE"
              title="A model number is a useful starting point."
            />
            <Details data={data} title="Include these appliance details." />
          </div>
          <Photo src={data.supportImage} alt={data.supportAlt} />
        </div>
      </Section>
      <Section>
        <div className={styles.timelineLayout}>
          <div>
            <Intro
              label="BEFORE WE BEGIN"
              title="A cool oven. A clear work area."
            />
            <Preparation
              text={data.preparation}
              title="Prepare the appliance"
            />
          </div>
          <Process data={data} vertical />
        </div>
      </Section>
    </>
  );
}

const bodies = {
  "house-cleaning": Regular,
  "property-cleaning": Deep,
  "end-of-lease-cleaning": Lease,
  "commercial-cleaning": Commercial,
  "airbnb-cleaning": Airbnb,
  "carpet-cleaning": Carpet,
  "garden-cleaning": OneOff,
  "construction-cleaning": Residential,
  "office-cleaning": Office,
  "window-cleaning": Windows,
  "oven-cleaning": Oven,
};

export function ServicePage({ service }: { service: Service }) {
  const data = servicePages[service.slug];
  const related = [...data.related, ...services.map((item) => item.slug)]
    .filter(
      (slug, index, all) =>
        slug !== service.slug &&
        all.indexOf(slug) === index &&
        services.some((item) => item.slug === slug),
    )
    .slice(0, 3);
  const Body = bodies[service.slug as keyof typeof bodies];
  return (
    <div
      className={styles.page}
      data-service={
        (
          {
            "house-cleaning": "regular-house-cleaning",
            "property-cleaning": "deep-cleaning",
            "garden-cleaning": "one-off-cleaning",
            "construction-cleaning": "residential-cleaning",
          } as Record<string, string>
        )[service.slug] || service.slug
      }
    >
      <Hero service={service} data={data} />
      <Body data={data} slug={service.slug} />
      <Section>
        <div className={styles.faqLayout}>
          <Intro
            label="YOUR QUESTIONS ANSWERED"
            title={`Before you request ${service.name.toLowerCase()}.`}
          />
          <ServiceFAQs questions={data.questions} />
        </div>
      </Section>
      <Section sage>
        <div className={styles.headingRow}>
          <Intro
            label="OTHER WAYS WE CAN HELP"
            title="Explore related cleaning services."
          />
          <Link href="/services" className={styles.textLink}>
            View all services <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.related}>
          {related.map((slug) => {
            const item = services.find((s) => s.slug === slug)!;
            return (
              <Link key={slug} href={`/services/${slug}`}>
                <Photo
                  src={item.thumbnail}
                  alt={`${item.name} service photograph`}
                />
                <div>
                  <h3>{item.name}</h3>
                  <span>
                    Explore the service{" "}
                    <ArrowRight size={16} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>
      <Section>
        <div className={styles.finalCta}>
          <Sparkles size={36} strokeWidth={1.2} aria-hidden="true" />
          <div>
            <span className={styles.kicker}>YOUR SPACE. A FRESH START.</span>
            <h2>{data.closing}</h2>
            <p>
              Share your requirements. We’ll review the details and agree the
              right scope for your space.
            </p>
          </div>
          <div className={styles.actions}>
            <Action href={`/contact?service=${service.slug}`}>
              Discuss{" "}
              {service.name === "Airbnb Cleaning"
                ? "your changeover"
                : "your clean"}
            </Action>
            <Link
              href={`/book?service=${service.slug}`}
              className={styles.textLink}
            >
              Request a booking <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}

export function ServicesOverview() {
  return (
    <div className={`${styles.page} ${styles.overview}`}>
      <section className={styles.overviewHero}>
        <div className={styles.container}>
          <Breadcrumb />
          <div className={styles.overviewHeading}>
            <div>
              <span className={styles.kicker}>THRIVE4 CLEANING SERVICES</span>
              <h1>
                Find the right care
                <br />
                for your space.
              </h1>
              <p>
                Explore House, Property, Garden and Construction Cleaning,
                alongside workplace and specialist services. Tell us what needs
                attention.
              </p>
            </div>
            <div className={styles.overviewNote}>
              <Sparkles size={32} strokeWidth={1.4} aria-hidden="true" />
              <p>
                Homes. Gardens. Workplaces. Sites.
                <br />
                <strong>A scope shaped around you.</strong>
              </p>
              <Link href="#service-directory" className={styles.textLink}>
                Explore {services.length} cleaning services{" "}
                <span aria-hidden="true">↓</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Section id="service-directory">
        <ServiceDirectory
          items={services.map((service) => ({
            slug: service.slug,
            name: service.name,
            image: service.thumbnail,
            alt: `${service.name} service photograph`,
            lead: service.summary,
            category:
              service.category === "Residential"
                ? "Home & Outdoor"
                : service.category === "Commercial"
                  ? "Business"
                  : "Specialist",
          }))}
        />
      </Section>
      <Section sage>
        <div className={styles.overviewBottom}>
          <Intro
            label="NOT SURE WHERE TO START?"
            title="Tell us about the space."
          >
            Share the property or outdoor area, its condition and the tasks that
            matter. The team can help clarify a suitable cleaning scope.
          </Intro>
          <Action href="/contact">Discuss your requirements</Action>
        </div>
      </Section>
    </div>
  );
}
