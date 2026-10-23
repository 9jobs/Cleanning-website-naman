import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  MousePointer2,
  Phone,
  Sparkles,
} from "lucide-react";
import { services, articles } from "@/lib/data";
import { serviceGuides } from "@/lib/completion-content";
import { site } from "@/lib/config";
import { BookingForm, EnquiryForm } from "./forms";
import { Reveal } from "./motion";
import { Photo } from "./ui";
import {
  CoverageDirectory,
  FeedbackPanel,
  HelpCentre,
  JournalLibrary,
} from "./completion-interactive";

export function FinishHeading({
  label,
  title,
  text,
}: {
  label: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="finish-heading">
      <span className="finish-kicker">{label}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}
export function CompletionCTA({ service }: { service?: string }) {
  const query = service ? `?service=${service}` : "";
  return (
    <section className="completion finish-section">
      <div className="finish-container">
        <Reveal distance={28} duration={0.55} className="finish-closing">
          <div>
            <span className="finish-kicker">YOUR SPACE. A FRESH START.</span>
            <h2>One less thing on your list.</h2>
            <p>
              Tell us what needs attention. Start with a cleaning request and
              we’ll help define the right scope for your space.
            </p>
          </div>
          <div className="finish-actions">
            <Link className="finish-button" href={`/book${query}`}>
              Request a clean <ArrowRight size={18} />
            </Link>
            <Link
              className="finish-button finish-button--outline"
              href={`/contact${query}`}
            >
              Get a quote <ArrowRight size={18} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
export function RequestSteps({ service }: { service?: string }) {
  return (
    <div className="completion finish-process">
      <FinishHeading
        label="A CLEAR WAY TO GET STARTED"
        title="Three steps towards a fresher space."
        text="Your preferred visit starts with a request. Coverage, scope and appointment details are confirmed before work begins."
      />
      <ol className="finish-step-track">
        {[
          {
            Icon: MousePointer2,
            title: "Choose your residential cleaning service",
            text: "Select the type of home cleaning that best suits your needs.",
          },
          {
            Icon: ClipboardList,
            title: "Tell us about your home",
            text: "Share property details, priority tasks, extras and your preferred timing.",
          },
          {
            Icon: MessageCircle,
            title: "Send your cleaning request",
            text: "Review your details. The team then confirms the quote and visit arrangements.",
          },
        ].map(({ Icon, title, text }, index) => (
          <li key={title}>
            <Reveal distance={28} duration={0.55} delay={index * 0.08}>
              <span className="finish-step-marker">
                <Icon size={25} />
                <small>0{index + 1}</small>
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </Reveal>
          </li>
        ))}
      </ol>
      <Link
        className="finish-text-link"
        href={`/book${service ? `?service=${service}` : ""}`}
      >
        Start your request <ArrowRight size={18} />
      </Link>
    </div>
  );
}
export function MoveOutFeature() {
  return (
    <section className="completion finish-section finish-sage">
      <div className="finish-container finish-editorial">
        <Reveal
          variant="left"
          distance={28}
          duration={0.55}
          className="finish-editorial-photo"
        >
          <Photo
            src="/images/lease.webp"
            alt="Clean kitchen surfaces ready for a property handover"
          />
          <span>MOVE-OUT CLEANING / A CLEAR CHECKLIST</span>
        </Reveal>
        <Reveal variant="right" distance={28} duration={0.55}>
          <FinishHeading
            label="END OF LEASE CLEANING"
            title="Make room for your next chapter."
            text="Moving comes with enough to organise. Share your property details, handover date and agent checklist so the clean can be planned around your move."
          />
          <ul className="finish-checks">
            {[
              "Agreed room-by-room vacate checklist",
              "Empty cupboards, wardrobes and accessible surfaces",
              "Kitchen, bathroom and floor cleaning",
              "Appliance detailing by arrangement",
            ].map((item) => (
              <li key={item}>
                <Check size={19} />
                {item}
              </li>
            ))}
          </ul>
          <Link
            className="finish-button"
            href="/services/end-of-lease-cleaning"
          >
            Explore move-out cleaning <ArrowRight size={18} />
          </Link>
          <p className="finish-small">
            Cleaning follows the agreed scope. Bond outcomes remain with the
            property manager or landlord.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
export function WhyCleaning() {
  return (
    <section className="completion finish-section">
      <div className="finish-container finish-why">
        <Reveal variant="image" distance={28} duration={0.55}>
          <Photo
            src="/images/thrive-window-cleaning.webp"
            alt="A gloved hand using a squeegee on glass"
          />
          <p className="finish-small">
            Thoughtful methods. Attention to the surfaces that matter.
          </p>
        </Reveal>
        <div>
          <Reveal distance={28} duration={0.55}>
            <FinishHeading
              label="A LITTLE MORE CONSIDERATION"
              title="Good cleaning starts with a clear plan."
              text="Different properties, outdoor areas and completed sites need different kinds of care. Start with a conversation about what matters to you."
            />
          </Reveal>
          <div className="finish-benefit-list">
            {[
              {
                Icon: ClipboardList,
                title: "Your priorities, written down",
                text: "An agreed checklist makes the inclusions clear before the visit.",
              },
              {
                Icon: CalendarDays,
                title: "A routine that suits your space",
                text: "Request regular upkeep, a one-off refresh or a preferred changeover window.",
              },
              {
                Icon: MessageCircle,
                title: "Room for the practical details",
                text: "Share access instructions, delicate surfaces and anything the team should know.",
              },
            ].map(({ Icon, title, text }, index) => (
              <Reveal
                key={title}
                distance={28}
                duration={0.55}
                delay={index * 0.08}
              >
                <span className="finish-icon">
                  <Icon size={23} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
export function CleaningDetailsGallery() {
  return (
    <section className="completion finish-section">
      <div className="finish-container">
        <Reveal distance={28} duration={0.55}>
          <FinishHeading
            label="CARE IN THE DETAILS"
            title="A closer look at a considered clean."
            text="From glass to kitchen appliances, the right attention starts with the material and the agreed task. These are illustrative cleaning photographs, not customer before-and-after results."
          />
        </Reveal>
        <div className="finish-detail-gallery">
          {[
            {
              src: "/images/thrive-oven-cleaning.webp",
              title: "Appliance detail",
              text: "Oven interiors and racks, with suitable methods for your appliance.",
              href: "/services/oven-cleaning",
            },
            {
              src: "/images/thrive-window-cleaning.webp",
              title: "A clearer outlook",
              text: "Accessible glass and agreed window surfaces, assessed for safe access.",
              href: "/services/window-cleaning",
            },
            {
              src: "/images/property-detail.webp",
              title: "Detailed property care",
              text: "A property-specific checklist for rooms, surfaces and everyday presentation.",
              href: "/services/property-cleaning",
            },
          ].map((item, index) => (
            <Reveal
              key={item.href}
              distance={28}
              duration={0.55}
              delay={index * 0.08}
            >
              <Link href={item.href}>
                <Photo src={item.src} alt={item.title} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className="finish-text-link">
                  Explore specialist care <ArrowRight size={17} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
export function HomeFeedback() {
  return (
    <section className="completion finish-section finish-sage">
      <div className="finish-container finish-feedback-home">
        <div>
          <FinishHeading
            label="LISTENING IS PART OF THE SERVICE"
            title="A better experience starts with you."
            text="Clear expectations and useful feedback help shape the next clean. Explore how to share your experience or ask about a service."
          />
          <Link className="finish-text-link" href="/reviews">
            Visit customer feedback <ArrowRight size={18} />
          </Link>
        </div>
        <FeedbackPanel compact />
      </div>
    </section>
  );
}
export function HomeCoverage() {
  return (
    <section className="completion finish-section">
      <div className="finish-container">
        <CoverageDirectory compact />
      </div>
    </section>
  );
}
export function HomeJournal() {
  return (
    <section className="completion finish-section">
      <div className="finish-container">
        <div className="finish-heading-row">
          <FinishHeading
            label="PRACTICAL CLEANING ADVICE"
            title="Small routines. A fresher everyday."
          />
          <Link className="finish-text-link" href="/blog">
            Browse cleaning guides <ArrowRight size={18} />
          </Link>
        </div>
        <JournalLibrary preview />
      </div>
    </section>
  );
}
export function HomeQuestions() {
  return (
    <section className="completion finish-section finish-sage">
      <div className="finish-container finish-help-layout">
        <div>
          <FinishHeading
            label="A LITTLE CLARITY"
            title="Good questions before your clean."
            text="Understand the service, request process and next steps before sharing your details."
          />
          <Link className="finish-button finish-button--outline" href="/faq">
            Explore all answers <ArrowRight size={18} />
          </Link>
        </div>
        <HelpCentre compact />
      </div>
    </section>
  );
}
export function HelpPageBody() {
  return (
    <section className="completion finish-section">
      <div className="finish-container finish-help-layout">
        <aside className="finish-help-aside">
          <span className="finish-icon">
            <MessageCircle size={25} />
          </span>
          <h2>
            A little guidance
            <br />
            for your next step.
          </h2>
          <p>
            Find answers by topic or search a task, room or booking question.
          </p>
          <p>Need help with a particular property?</p>
          <Link className="finish-text-link" href="/contact">
            Ask the team <ArrowRight size={18} />
          </Link>
        </aside>
        <HelpCentre />
      </div>
    </section>
  );
}

export function ContactCompletion({
  kind,
  initial,
  live,
}: {
  kind: "contact" | "quote";
  initial: Record<string, string>;
  live: boolean;
}) {
  const selected = services.find((service) => service.slug === initial.service);
  return (
    <section className="completion finish-section">
      <div className="finish-container">
        {!live && (
          <div className="finish-dev-note" role="note">
            <strong>Development preview</strong>
            <p>
              Online enquiries are not connected yet. You can complete and
              validate this form, but no enquiry is received until the business
              enables submissions.
            </p>
          </div>
        )}
        <div className="finish-contact-layout">
          <aside>
            <FinishHeading
              label={
                kind === "quote"
                  ? "LET’S DEFINE YOUR CLEAN"
                  : "START A CONVERSATION"
              }
              title={
                kind === "quote"
                  ? "Tell us what matters to your space."
                  : "A useful conversation starts here."
              }
              text="Share the rooms, timing and practical details. The team can then review the service and scope that suit your property."
            />
            <div className="finish-contact-methods">
              {site.phone && (
                <a href={`tel:${site.phone}`}>
                  <Phone size={22} />
                  <span>
                    <strong>Call the team</strong>
                    <small>{site.phone}</small>
                  </span>
                </a>
              )}
              {site.email && (
                <a href={`mailto:${site.email}`}>
                  <Mail size={22} />
                  <span>
                    <strong>Email the team</strong>
                    <small>{site.email}</small>
                  </span>
                </a>
              )}
              <div>
                <ClipboardList size={23} />
                <span>
                  <strong>A helpful enquiry includes</strong>
                  <small>
                    Your suburb, property type, priority tasks and preferred
                    timing.
                  </small>
                </span>
              </div>
              <div>
                <Clock3 size={23} />
                <span>
                  <strong>Preferred timing</strong>
                  <small>
                    {site.hours && !/confirmation|subject to/i.test(site.hours)
                      ? site.hours
                      : "Share a preferred date and time. Availability is confirmed directly."}
                  </small>
                </span>
              </div>
            </div>
            <div className="finish-contact-links">
              <Link href="/faq">
                Common questions <ArrowRight size={17} />
              </Link>
              <Link href="/areas">
                Check your service area <ArrowRight size={17} />
              </Link>
            </div>
          </aside>
          <div className="finish-form-wrap">
            {selected && (
              <div className="finish-form-context">
                <Check size={19} />
                <span>
                  Enquiring about <strong>{selected.name}</strong>
                </span>
              </div>
            )}
            {initial.location && (
              <p className="finish-form-context">
                <MapPin size={19} />
                Your area enquiry: {initial.location.slice(0, 80)}. Please
                include this suburb in your message.
              </p>
            )}
            <EnquiryForm
              kind={kind}
              postcode={initial.postcode}
              initial={initial}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
export function BookingCompletion({
  initial,
  live,
}: {
  initial: Record<string, string>;
  live: boolean;
}) {
  return (
    <section className="completion finish-section finish-booking">
      <div className="finish-container">
        {!live && (
          <div className="finish-dev-note" role="note">
            <strong>Development preview</strong>
            <p>
              Booking submissions are not connected. Explore the request flow;
              no request is received or appointment reserved until submissions
              are enabled.
            </p>
          </div>
        )}
        <div className="finish-request-note">
          <CalendarDays size={22} />
          <span>
            <strong>A request, then a confirmed plan.</strong> Your selected
            date is a preference. The team confirms coverage, scope, price and
            timing before work begins.
          </span>
        </div>
        <BookingForm initial={initial} />
      </div>
    </section>
  );
}
export function CareerCompletion({ live }: { live: boolean }) {
  return (
    <div className="completion">
      <section className="finish-section">
        <div className="finish-container finish-editorial">
          <Reveal variant="left" distance={28} duration={0.55}>
            <FinishHeading
              label="AN EYE FOR THE DETAILS"
              title="Pride in the work. Care for the space."
              text="Register your interest in cleaning work with Thrive4 Cleaning. Tell us about your experience, location and availability so the team has the details to consider for future opportunities."
            />
            <ul className="finish-checks">
              {[
                "Respect for properties, outdoor areas and personal belongings",
                "Clear communication and reliable attendance",
                "Valid Australian working rights",
                "Careful use of equipment and surface-appropriate methods",
              ].map((item) => (
                <li key={item}>
                  <Check size={19} />
                  {item}
                </li>
              ))}
            </ul>
            <a href="#cleaning-application" className="finish-button">
              Register your interest <ArrowRight size={18} />
            </a>
          </Reveal>
          <Reveal variant="image" distance={28} duration={0.55}>
            <Photo
              className="finish-career-photo"
              src="/images/careers-detail.webp"
              alt="Male professional carefully wiping a stair handrail"
            />
          </Reveal>
        </div>
      </section>
      <section id="cleaning-application" className="finish-section finish-sage">
        <div className="finish-container finish-career-application">
          <aside>
            <FinishHeading
              label="EXPRESS YOUR INTEREST"
              title="Tell us about your experience."
              text="This is an expression of interest, not an offer of work. Specific roles, employment arrangements, pay and conditions are discussed only when an opportunity is available."
            />
            <p className="finish-small">
              You may attach a PDF résumé up to 5 MB. Include only information
              relevant to your application.
            </p>
          </aside>
          <div className="finish-form-wrap">
            {!live && (
              <div className="finish-dev-note">
                <strong>Development preview</strong>
                <p>
                  Applications and résumé uploads are not connected. No
                  application is received until the business enables
                  submissions.
                </p>
              </div>
            )}
            <EnquiryForm kind="careers" />
          </div>
        </div>
      </section>
    </div>
  );
}

export function ServiceCompletion({
  service,
}: {
  service: (typeof services)[number];
}) {
  const guide = serviceGuides[service.slug];
  return (
    <div className="completion">
      <section className="finish-section">
        <div className="finish-container finish-service-overview">
          <Reveal distance={28} duration={0.55}>
            <FinishHeading
              label="IS THIS THE RIGHT CLEAN?"
              title={guide.focus}
              text={guide.audience}
            />
            <Link
              href={`/contact?service=${service.slug}`}
              className="finish-text-link"
            >
              Discuss this service <ArrowRight size={18} />
            </Link>
          </Reveal>
          <aside className="finish-preparation">
            <span className="finish-icon">
              <ClipboardList size={24} />
            </span>
            <h3>Before your visit</h3>
            <p>{guide.preparation}</p>
            <span className="finish-small">
              Access, condition and the final checklist are reviewed before the
              appointment is agreed.
            </span>
          </aside>
        </div>
      </section>
      <section className="finish-section finish-sage">
        <div className="finish-container">
          <FinishHeading
            label="THE AGREED CHECKLIST"
            title="What your clean can include."
            text="The following tasks guide this service. Your final written scope sets out the areas, access requirements and inclusions agreed for your property."
          />
          <div className="finish-inclusion-grid">
            {service.includes.map((item, index) => (
              <Reveal
                key={item}
                distance={28}
                duration={0.55}
                delay={index * 0.08}
              >
                <span>0{index + 1}</span>
                <Check size={22} />
                <h3>{item}</h3>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section className="finish-section">
        <div className="finish-container finish-service-extras">
          <div>
            <span className="finish-icon">
              <Sparkles size={24} />
            </span>
            <FinishHeading
              label="A SCOPE THAT SUITS YOUR SPACE"
              title="A few details make a better plan."
            />
          </div>
          <div>
            <p>{service.extra}</p>
            <p>
              Tell us about surface materials, priority tasks and any existing
              damage when making your enquiry. Specialist access and extra work
              must be agreed before the visit.
            </p>
            <Link
              className="finish-button"
              href={`/contact?service=${service.slug}`}
            >
              Build your service enquiry <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="finish-section finish-sage">
        <div className="finish-container">
          <RequestSteps service={service.slug} />
        </div>
      </section>
      <section className="finish-section">
        <div className="finish-container finish-help-layout">
          <FinishHeading
            label="YOUR SERVICE QUESTIONS"
            title={`Before you request ${service.name.toLowerCase()}.`}
          />
          <div className="finish-accordion">
            {[
              ...guide.questions,
              [
                "How do I get a quote for this service?",
                "Share your location, property details, current condition and the work you need. A written quote confirms the agreed scope. No payment details are required to submit a quote enquiry.",
              ],
            ].map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <span aria-hidden="true">+</span>
                </summary>
                <div className="finish-answer">
                  <p>{answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="finish-section finish-sage">
        <div className="finish-container">
          <FinishHeading
            label="OTHER WAYS WE CAN HELP"
            title="Explore related cleaning services."
          />
          <div className="finish-related">
            {services
              .filter(
                (item) =>
                  item.slug !== service.slug &&
                  item.category === service.category,
              )
              .concat(
                services.filter((item) => item.category !== service.category),
              )
              .slice(0, 3)
              .map((item) => (
                <Link key={item.slug} href={`/services/${item.slug}`}>
                  <span className="finish-kicker">{item.category}</span>
                  <h3>{item.name}</h3>
                  <p>{item.intro}</p>
                  <ArrowRight size={22} />
                </Link>
              ))}
          </div>
        </div>
      </section>
      <CompletionCTA service={service.slug} />
    </div>
  );
}

export function ArticleCompletion({
  article,
}: {
  article: (typeof articles)[number];
}) {
  return (
    <div className="completion finish-article-layout">
      <aside>
        <span className="finish-kicker">IN THIS GUIDE</span>
        <nav aria-label="Article contents">
          {article.sections.map(([title], index) => (
            <a key={title} href={`#guide-section-${index + 1}`}>
              {title}
            </a>
          ))}
        </nav>
        <Link className="finish-text-link" href="/services">
          Explore cleaning help <ArrowRight size={17} />
        </Link>
      </aside>
      <div>
        {article.sections.map(([title, text], index) => (
          <section key={title} id={`guide-section-${index + 1}`}>
            <h2>{title}</h2>
            <p>{text}</p>
          </section>
        ))}
        <div className="finish-article-tip">
          <Sparkles size={24} />
          <div>
            <h3>Care starts with the surface.</h3>
            <p>
              Follow product and manufacturer instructions, ventilate the area
              and keep children and pets clear. Do not mix cleaning chemicals.
              Ask about delicate finishes before treating them.
            </p>
          </div>
        </div>
        <p className="finish-small">
          Practical cleaning guidance from {site.name}. Property-specific
          instructions and the agreed service scope take priority.
        </p>
      </div>
    </div>
  );
}
export function RelatedGuides({ exclude }: { exclude: string }) {
  return (
    <section className="completion finish-section finish-sage">
      <div className="finish-container">
        <FinishHeading
          label="MORE PRACTICAL GUIDANCE"
          title="Keep the fresh start going."
        />
        <div className="finish-related">
          {articles
            .filter((item) => item.slug !== exclude)
            .map((item) => (
              <Link key={item.slug} href={`/blog/${item.slug}`}>
                <span className="finish-kicker">
                  {item.category} · {item.read}
                </span>
                <h3>{item.title}</h3>
                <p>{item.intro}</p>
                <ArrowRight size={22} />
              </Link>
            ))}
        </div>
      </div>
    </section>
  );
}
