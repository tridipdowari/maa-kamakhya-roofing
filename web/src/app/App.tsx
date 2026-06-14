import { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import { Toaster } from "sonner";
import { quoteRequestService, homepageSettingsService } from "../lib/supabaseService";
import type { HomepageSettings } from "../lib/supabaseService";
import {
  Phone,
  MessageCircle,
  Menu,
  X,
  ChevronRight,
  Star,
  Shield,
  Clock,
  Award,
  Wrench,
  Home,
  Building2,
  Droplets,
  Factory,
  CheckCircle2,
  MapPin,
  Mail,
  Facebook,
  Instagram,
  Youtube,
  ArrowRight,
  Users,
  ThumbsUp,
} from "lucide-react";

const AdminApp = lazy(() => import("./admin/AdminApp"));

const NAV_ITEMS = ["Home", "About", "Services", "Projects", "Contact"];

const SERVICES = [
  {
    icon: Home,
    title: "Roof Installation",
    desc: "Full roof installation for residential homes, warehouses, and commercial buildings using premium materials.",
  },
  {
    icon: Wrench,
    title: "Roof Repair & Maintenance",
    desc: "Expert repair and preventive maintenance to extend roof life and prevent costly damage.",
  },
  {
    icon: Factory,
    title: "Metal Roofing",
    desc: "Durable galvanised iron and color-coated metal roofing solutions built for Assam's climate.",
  },
  {
    icon: Droplets,
    title: "Leak Proofing",
    desc: "Advanced waterproofing treatments that seal leaks and protect your structure from monsoon rains.",
  },
  {
    icon: Building2,
    title: "Sheds & Structures",
    desc: "Custom industrial sheds, warehouse structures, and agriculture shelters built to specification.",
  },
];


const FEATURES = [
  {
    icon: Shield,
    title: "Premium Quality Materials",
    desc: "ISI-marked and weather-tested materials sourced from certified suppliers.",
  },
  {
    icon: Users,
    title: "Skilled Professionals",
    desc: "Trained and experienced roofing specialists with 10+ years in the field.",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    desc: "We commit to timelines and deliver every project on schedule, every time.",
  },
  {
    icon: Award,
    title: "Weather Resistant Roofing",
    desc: "Engineered to withstand Assam's heavy monsoons, heat, and wind loads.",
  },
  {
    icon: ThumbsUp,
    title: "Affordable Pricing",
    desc: "Transparent, competitive quotes with no hidden charges or surprise costs.",
  },
  {
    icon: CheckCircle2,
    title: "Customer Satisfaction",
    desc: "300+ happy clients across Golaghat district and beyond speak for our work.",
  },
];

const PROJECTS = [
  {
    img: "https://images.unsplash.com/photo-1763665814538-8ba04597286c?w=600&h=400&fit=crop&auto=format",
    type: "Metal Roofing",
    location: "Golaghat",
    alt: "Metal roof tiles installation project",
  },
  {
    img: "https://images.unsplash.com/photo-1763665814965-b5c4b3547908?w=600&h=400&fit=crop&auto=format",
    type: "Residential Roof",
    location: "Jorhat",
    alt: "Residential roofing project in Jorhat",
  },
  {
    img: "https://images.unsplash.com/photo-1632862378913-b4fe820ce73b?w=600&h=400&fit=crop&auto=format",
    type: "Shed Construction",
    location: "Dergaon",
    alt: "Industrial shed construction",
  },
  {
    img: "https://images.unsplash.com/photo-1704892712277-05dd8ba8831b?w=600&h=400&fit=crop&auto=format",
    type: "Commercial Building",
    location: "Bokakhat",
    alt: "Commercial roofing project in Bokakhat",
  },
  {
    img: "https://images.unsplash.com/photo-1723110994499-df46435aa4b3?w=600&h=400&fit=crop&auto=format",
    type: "Roof Repair",
    location: "Numaligarh",
    alt: "Roof repair project",
  },
  {
    img: "https://images.unsplash.com/photo-1628002881911-8bcdfbdf320e?w=600&h=400&fit=crop&auto=format",
    type: "Leak Proofing",
    location: "Titabar",
    alt: "Waterproofing and leak proofing work",
  },
];

const TESTIMONIALS = [
  {
    name: "Rajesh Bora",
    location: "Golaghat",
    rating: 5,
    text: "Excellent work by Maa Kamakhya team. They installed a full metal roof on my warehouse within 3 days, clean finish, no leaks during last monsoon. Very professional.",
    initials: "RB",
    color: "bg-blue-700",
  },
  {
    name: "Priya Saikia",
    location: "Jorhat",
    rating: 5,
    text: "Our home had a terrible leak problem every monsoon. They identified the issue immediately and did a complete leak-proofing job. Outstanding service and fair pricing.",
    initials: "PS",
    color: "bg-red-700",
  },
  {
    name: "Dipankar Gogoi",
    location: "Dergaon",
    rating: 5,
    text: "Built a large agricultural shed for my farm. The team was disciplined, finished ahead of schedule, and the structure is rock solid. Highly recommend them.",
    initials: "DG",
    color: "bg-amber-600",
  },
  {
    name: "Mrinmoy Das",
    location: "Bokakhat",
    rating: 5,
    text: "Replaced the old roof on my commercial building. They used quality materials and the work is very neat. No complaints at all. Will hire again for my next property.",
    initials: "MD",
    color: "bg-blue-900",
  },
];

const AREAS = [
  "Golaghat",
  "Jorhat",
  "Dergaon",
  "Bokakhat",
  "Numaligarh",
  "Titabar",
];

function PublicSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formStatus, setFormStatus] = useState("");
  const [homepageSettings, setHomepageSettings] = useState<HomepageSettings | null>(null);

  const onSubmitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus("Sending...");

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    formData.append("access_key", import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || "YOUR_ACCESS_KEY_HERE");

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      // Submit to Web3Forms (for email notification)
      const web3formsResponse = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: json
      });
      const web3formsData = await web3formsResponse.json();

      // Also submit to Supabase for storage in admin dashboard
      const now = new Date();
      const dateSubmitted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const quoteRequestData = {
        customerName: object.name.trim(),
        phone: object.phone.trim(),
        email: object.email.toLowerCase().trim(),
        serviceNeeded: (object.service || "Other").trim(),
        location: object.location.trim(),
        message: (object.message || "").trim(),
        dateSubmitted,
        status: "Pending" as const
      };

      await quoteRequestService.create(quoteRequestData);

      if (web3formsData.success) {
        setFormStatus("Success! Your quote request has been sent and saved.");
        formElement.reset();
      } else {
        setFormStatus("Success! Your quote request has been saved successfully. We'll get back to you shortly!");
        formElement.reset();
      }
    } catch (error: any) {
      console.error("Submission Error:", error);
      setFormStatus("There was an issue submitting your request. Please try again or contact us directly.");
    }
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchHomepageSettings = async () => {
      try {
        const settings = await homepageSettingsService.get();
        setHomepageSettings(settings);
      } catch (error) {
        console.error("Failed to fetch homepage settings:", error);
      }
    };

    fetchHomepageSettings();
  }, []);

  const phoneNumber = "+916370268346";
  const whatsappNumber = "916370268346";
  const callHref = `tel:${phoneNumber}`;
  const waHref = `https://wa.me/${whatsappNumber}?text=Hello%2C%20I%20would%20like%20to%20get%20a%20free%20roofing%20quote.`;

  return (
    <div className="min-h-screen bg-background font-['Inter',sans-serif] scroll-smooth">
      {/* ── STICKY NAV ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white shadow-lg py-3" : "bg-[#0B2E6B] py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2.5 shrink-0">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${scrolled ? "bg-[#0B2E6B]" : "bg-[#F4B400]"}`}
            >
              <Home
                className={`w-5 h-5 ${scrolled ? "text-white" : "text-[#0B2E6B]"}`}
              />
            </div>
            <div>
              <p
                className={`font-['Poppins',sans-serif] font-bold text-sm leading-tight ${scrolled ? "text-[#0B2E6B]" : "text-white"}`}
              >
                Maa Kamakhya
              </p>
              <p
                className={`text-[10px] font-medium tracking-wider uppercase ${scrolled ? "text-[#D72626]" : "text-[#F4B400]"}`}
              >
                Roofing Contractors
              </p>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`text-sm font-medium transition-colors hover:text-[#F4B400] ${
                  scrolled ? "text-[#0B2E6B]" : "text-white/90"
                }`}
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`lg:hidden p-2 rounded-lg ${scrolled ? "text-[#0B2E6B]" : "text-white"}`}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-3 text-[#0B2E6B] font-medium rounded-lg hover:bg-blue-50 transition-colors"
                >
                  {item}
                </a>
              ))}
              {/* Mobile nav contains only navigation links - CTAs are in hero section */}

            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section
        id="home"
        className="relative min-h-screen flex items-center bg-[#0B2E6B] overflow-hidden"
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="
    absolute
    inset-x-0
    top-[55%]
    bottom-0
    overflow-hidden

    md:top-0
    md:bottom-auto
    md:right-0
    md:left-auto
    md:w-1/2
    md:h-full
"
        >
          <img
            src="https://images.unsplash.com/photo-1763665814538-8ba04597286c?w=900&h=900&fit=crop&auto=format"
            alt="Professional roofing installation by Maa Kamakhya team"
            className="w-full h-full object-cover opacity-30 md:translate-y-0"
          />

          <div
            className="
      absolute inset-0

      bg-gradient-to-b
    from-[#0B2E6B]
    via-[#0B2E6B]/40
      to-transparent

      md:bg-gradient-to-r
      md:from-[#0B2E6B]
      md:via-[#0B2E6B]/60
      md:to-transparent
    "
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20 md:pb-28 grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Left content */}
          <div className="space-y-6">
            {homepageSettings && (
              <>
                <div className="inline-flex items-center gap-2 bg-[#F4B400]/15 border border-[#F4B400]/30 rounded-full px-4 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F4B400] animate-pulse" />
                  <span className="text-[#F4B400] text-xs font-semibold tracking-wider uppercase">
                    Est. {homepageSettings.yearsExperience} · Assam, India
                  </span>
                </div>

                <h1 className="font-['Poppins',sans-serif] font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.1]">
                  {(homepageSettings as HomepageSettings).heroTitle}
                </h1>
                <p className="mt-2 text-[#F4B400] text-lg sm:text-xl">
                  {(homepageSettings as HomepageSettings).heroSubtitle}
                </p>

                <p className="text-blue-200 text-lg sm:text-xl leading-relaxed max-w-lg">
                  Professional Roofing Solutions for Homes, Warehouses &amp;
                  Commercial Buildings across Assam.
                </p>

                <p className="text-blue-100/80 text-sm leading-relaxed max-w-md">
                  With{" "}
                  <strong className="text-white">{(homepageSettings as HomepageSettings).yearsExperience}+ years of experience</strong>{" "}
                  and{" "}
                  <strong className="text-white">{(homepageSettings as HomepageSettings).projectsCompleted}+ completed projects</strong>,
                  we deliver roofing you can trust through every monsoon.
                </p>
              </>
            )}

            {!homepageSettings && (
              <>
                <div className="inline-flex items-center gap-2 bg-[#F4B400]/15 border border-[#F4B400]/30 rounded-full px-4 py-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F4B400] animate-pulse" />
                  <span className="text-[#F4B400] text-xs font-semibold tracking-wider uppercase">
                    Est. 2015 · Assam, India
                  </span>
                </div>

                <h1 className="font-['Poppins',sans-serif] font-black text-4xl sm:text-5xl lg:text-6xl text-white leading-[1.1]">
                  Strong Roofs.
                </h1>
                <p className="mt-2 text-[#F4B400] text-lg sm:text-xl">
                  Stronger Trust.
                </p>

                <p className="text-blue-200 text-lg sm:text-xl leading-relaxed max-w-lg">
                  Professional Roofing Solutions for Homes, Warehouses &amp;
                  Commercial Buildings across Assam.
                </p>

                <p className="text-blue-100/80 text-sm leading-relaxed max-w-md">
                  With{" "}
                  <strong className="text-white">11+ years of experience</strong>{" "}
                  and{" "}
                  <strong className="text-white">300+ completed projects</strong>,
                  we deliver roofing you can trust through every monsoon.
                </p>
              </>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href="#contact"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#D72626] text-white font-semibold text-base hover:bg-[#b91c1c] transition-all shadow-lg shadow-red-900/30 active:scale-95"
              >
                {homepageSettings ? homepageSettings.ctaButtonText : "Get Free Quote"} <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href={callHref}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#0B2E6B] font-semibold text-base hover:bg-blue-50 transition-all shadow-lg active:scale-95"
              >
                <Phone className="w-4 h-4" /> Call Now
              </a>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#25D366] text-white font-semibold text-base hover:bg-[#1fba58] transition-all shadow-lg active:scale-95"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp Us
              </a>
            </div>
          </div>

          {/* Right image – mobile only */}
          {/* <div className="md:hidden rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1763665814538-8ba04597286c?w=800&h=500&fit=crop&auto=format"
              alt="Roofing installation project"
              className="w-full h-64 object-cover"
            />
          </div> */}
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 80H1440V40C1200 80 960 0 720 40C480 80 240 0 0 40V80Z"
              fill="#F8FAFC"
            />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                value: homepageSettings ? `${homepageSettings.yearsExperience}+` : "11+",
                label: "Years Experience",
                icon: Award,
                color: "text-[#0B2E6B]",
                bg: "bg-blue-50",
              },
              {
                value: homepageSettings ? `${homepageSettings.projectsCompleted}+` : "300+",
                label: "Projects Completed",
                icon: CheckCircle2,
                color: "text-[#D72626]",
                bg: "bg-red-50",
              },
              {
                value: homepageSettings ? `${homepageSettings.skilledProfessionals}+` : "50+",
                label: "Skilled Professionals",
                icon: Users,
                color: "text-[#F4B400]",
                bg: "bg-amber-50",
              },
              {
                value: homepageSettings ? `${homepageSettings.customerSatisfaction}%` : "100%",
                label: "Customer Satisfaction",
                icon: ThumbsUp,
                color: "text-[#0B2E6B]",
                bg: "bg-blue-50",
              },
            ].map(({ value, label, icon: Icon, color, bg }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-6 shadow-sm border border-border text-center hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <p
                  className={`font-['Poppins',sans-serif] font-black text-3xl sm:text-4xl ${color}`}
                >
                  {value}
                </p>
                <p className="text-muted-foreground text-sm mt-1 font-medium">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-[#D72626] text-xs font-bold tracking-widest uppercase">
              What We Do
            </span>
            <h2 className="font-['Poppins',sans-serif] font-black text-3xl sm:text-4xl text-[#0B2E6B] mt-2">
              Our Services
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              End-to-end roofing solutions delivered with craftsmanship and
              built to last decades.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group bg-background rounded-2xl p-7 border border-border hover:border-[#0B2E6B]/30 hover:shadow-lg transition-all cursor-default"
              >
                <div className="w-14 h-14 bg-[#0B2E6B] rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#D72626] transition-colors">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-['Poppins',sans-serif] font-bold text-lg text-[#0B2E6B] mb-2">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-[#D72626] text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
            {/* CTA card */}
            <div className="bg-[#0B2E6B] rounded-2xl p-7 flex flex-col justify-between">
              <div>
                <h3 className="font-['Poppins',sans-serif] font-bold text-xl text-white mb-3">
                  Need a Custom Solution?
                </h3>
                <p className="text-blue-200 text-sm leading-relaxed">
                  Every building is different. Tell us what you need and we will
                  design the right roofing plan for you.
                </p>
              </div>
              <a
                href="#contact"
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-[#F4B400] text-[#0B2E6B] rounded-xl font-bold text-sm hover:bg-yellow-400 transition-colors"
              >
                {homepageSettings ? homepageSettings.ctaButtonText : "Get Free Quote"} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section
        id="about"
        className="py-20 bg-[#0B2E6B] relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-[#F4B400] text-xs font-bold tracking-widest uppercase">
              Why Us
            </span>
            <h2 className="font-['Poppins',sans-serif] font-black text-3xl sm:text-4xl text-white mt-2">
              Why Choose Maa Kamakhya?
            </h2>
            <p className="text-blue-200 mt-3 max-w-xl mx-auto">
              Trusted by hundreds of families and businesses across Golaghat
              district since 2015.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {homepageSettings && homepageSettings.whyChooseUsPoints && homepageSettings.whyChooseUsPoints.length > 0 ? (
              <>
                {homepageSettings.whyChooseUsPoints.map(({ title, description }, index) => (
                  <div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-[#F4B400] rounded-xl flex items-center justify-center mb-4">
                      {/* Use a default icon or rotate through some icons */}
                      <Shield className="w-6 h-6 text-[#0B2E6B]" />
                    </div>
                    <h3 className="font-['Poppins',sans-serif] font-bold text-white mb-2">
                      {title}
                    </h3>
                    <p className="text-blue-200 text-sm leading-relaxed">{description}</p>
                  </div>
                ))}
              </>
            ) : (
              <>
                {FEATURES.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-[#F4B400] rounded-xl flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-[#0B2E6B]" />
                    </div>
                    <h3 className="font-['Poppins',sans-serif] font-bold text-white mb-2">
                      {title}
                    </h3>
                    <p className="text-blue-200 text-sm leading-relaxed">{desc}</p>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section id="projects" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-[#D72626] text-xs font-bold tracking-widest uppercase">
              Portfolio
            </span>
            <h2 className="font-['Poppins',sans-serif] font-black text-3xl sm:text-4xl text-[#0B2E6B] mt-2">
              Featured Projects
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              A selection of roofing projects completed across Golaghat district
              and nearby areas.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.map(({ img, type, location, alt }) => (
              <div
                key={`${type}-${location}`}
                className="group rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-xl transition-all bg-white"
              >
                <div className="relative overflow-hidden h-52 bg-blue-100">
                  <img
                    src={img}
                    alt={alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block bg-[#D72626] text-white text-xs font-bold px-3 py-1 rounded-full mb-1">
                      {type}
                    </span>
                    <div className="flex items-center gap-1 text-white text-sm font-medium">
                      <MapPin className="w-3.5 h-3.5 text-[#F4B400]" />{" "}
                      {location}, Assam
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-[#D72626] text-xs font-bold tracking-widest uppercase">
              Testimonials
            </span>
            <h2 className="font-['Poppins',sans-serif] font-black text-3xl sm:text-4xl text-[#0B2E6B] mt-2">
              What Our Clients Say
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {TESTIMONIALS.map(
              ({ name, location, rating, text, initials, color }) => (
                <div
                  key={name}
                  className="bg-background rounded-2xl p-7 border border-border hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-[#F4B400] text-[#F4B400]"
                      />
                    ))}
                  </div>
                  <p className="text-foreground/80 text-sm leading-relaxed mb-5">
                    &ldquo;{text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${color} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0`}
                    >
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-[#0B2E6B] text-sm">
                        {name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {location}, Assam
                      </p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      {/* ── SERVICE AREAS ── */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#D72626] text-xs font-bold tracking-widest uppercase">
                Coverage
              </span>
              <h2 className="font-['Poppins',sans-serif] font-black text-3xl sm:text-4xl text-[#0B2E6B] mt-2 mb-4">
                Areas We Serve
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                We provide professional roofing services across Golaghat
                district and nearby regions in Assam. If you are located in or
                around these areas, we are ready to help.
              </p>
              <div className="flex flex-wrap gap-3">
                {AREAS.map((area) => (
                  <div
                    key={area}
                    className="flex items-center gap-2 bg-white border border-border rounded-xl px-4 py-2.5 shadow-sm"
                  >
                    <MapPin className="w-4 h-4 text-[#D72626] shrink-0" />
                    <span className="font-semibold text-[#0B2E6B] text-sm">
                      {area}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-2 bg-[#F4B400]/10 border border-[#F4B400]/30 rounded-xl px-4 py-2.5">
                  <span className="font-semibold text-[#0B2E6B] text-sm">
                    & nearby areas
                  </span>
                </div>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                Not sure if we cover your area? Call us at{" "}
                <a
                  href="tel:+916370268346"
                  className="text-[#D72626] font-semibold hover:underline"
                >
                  +91 63702 68346
                </a>
              </p>
            </div>
            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-border bg-blue-50 aspect-[4/3] flex items-center justify-center relative">
              <iframe
                title="Maa Kamakhya Roofing - Golaghat, Assam"
                src="https://maps.google.com/maps?q=Golaghat,Assam,India&z=10&output=embed"
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute top-3 left-3 bg-[#0B2E6B] text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow">
                <MapPin className="w-3.5 h-3.5 text-[#F4B400]" /> Golaghat
                District, Assam
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
      <section id="contact" className="py-20 bg-[#D72626] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, #fff 0, transparent 50%), radial-gradient(circle at 80% 50%, #fff 0, transparent 50%)" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side text & contact info */}
            <div className="text-white">
              <h2 className="font-['Poppins',sans-serif] font-black text-3xl sm:text-4xl lg:text-5xl mb-4">
                Need Reliable Roofing Solutions?
              </h2>
              <p className="text-red-100 text-lg mb-8 max-w-lg">
                Get a free, no-obligation estimate from Assam&apos;s trusted roofing specialists. We respond within 24 hours.
              </p>
              
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-[#F4B400]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Our Location</h4>
                    <p className="text-red-100 text-sm leading-relaxed">Golaghat District, Assam, India<br />Serving Golaghat, Jorhat, Dergaon & nearby areas</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-[#F4B400]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Phone Numbers</h4>
                    <p className="text-red-100 text-sm flex flex-col gap-1">
                      <a href="tel:+916370268346" className="hover:text-white transition-colors">+91 63702 68346</a>
                      <a href="tel:+918011584169" className="hover:text-white transition-colors">+91 80115 84169</a>
                      <a href="tel:+916000966614" className="hover:text-white transition-colors">+91 60009 66614</a>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-[#F4B400]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Email Address</h4>
                    <p className="text-red-100 text-sm">
                      <a href="mailto:maakamakhya9666@gmail.com" className="hover:text-white transition-colors break-all">maakamakhya9666@gmail.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side form */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
              <h3 className="font-['Poppins',sans-serif] font-bold text-2xl text-[#0B2E6B] mb-6">Request a Free Quote</h3>
              <form className="space-y-4" onSubmit={onSubmitForm}>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="name" id="name" placeholder="John Doe" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D72626] focus:border-[#D72626] outline-none transition-all" required />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" name="phone" id="phone" placeholder="+91 98765 43210" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D72626] focus:border-[#D72626] outline-none transition-all" required />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</label>
                    <input type="email" name="email" id="email" placeholder="john@example.com" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D72626] focus:border-[#D72626] outline-none transition-all" required />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="location" className="text-sm font-medium text-gray-700">Project Location</label>
                    <input type="text" name="location" id="location" placeholder="e.g. Golaghat, Assam" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D72626] focus:border-[#D72626] outline-none transition-all" required />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label htmlFor="service" className="text-sm font-medium text-gray-700">Service Needed</label>
                  <select name="service" id="service" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D72626] focus:border-[#D72626] outline-none transition-all bg-white" required>
                    <option value="">Select a service...</option>
                    <option value="installation">Roof Installation</option>
                    <option value="repair">Roof Repair & Maintenance</option>
                    <option value="metal">Metal Roofing</option>
                    <option value="leak">Leak Proofing</option>
                    <option value="shed">Sheds & Structures</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700">Additional Details</label>
                  <textarea name="message" id="message" rows={4} placeholder="Tell us about your project or issue..." className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D72626] focus:border-[#D72626] outline-none transition-all resize-none"></textarea>
                </div>

                <button type="submit" disabled={formStatus === "Sending..."} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg bg-[#0B2E6B] text-white font-semibold hover:bg-blue-900 transition-colors shadow-md mt-2 disabled:opacity-70">
                  {formStatus === "Sending..." ? "Sending..." : "Get My Free Quote"} <ArrowRight className="w-4 h-4" />
                </button>
                {formStatus && formStatus !== "Sending..." && (
                  <p role="alert" className={`text-sm text-center mt-3 font-medium ${formStatus.includes("Success") ? "text-green-600" : "text-red-600"}`}>
                    {formStatus}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        id="contact-footer"
        className="bg-[#070f1f] text-white pt-16 pb-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-[#F4B400] rounded-lg flex items-center justify-center">
                  <Home className="w-5 h-5 text-[#0B2E6B]" />
                </div>
                <div>
                  <p className="font-['Poppins',sans-serif] font-bold text-sm">
                    Maa Kamakhya
                  </p>
                  <p className="text-[10px] text-[#F4B400] font-semibold tracking-wider uppercase">
                    Roofing Contractors
                  </p>
                </div>
              </div>
              <p className="text-white/60 text-sm leading-relaxed mb-5">
                Strong Roofs. Stronger Trust. Serving Assam with professional
                roofing solutions since 2015.
              </p>
              <div className="flex gap-3">
                {[
                  { Icon: Facebook, label: "Facebook" },
                  { Icon: Instagram, label: "Instagram" },
                  { Icon: Youtube, label: "YouTube" },
                ].map(({ Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#F4B400] hover:text-[#0B2E6B] transition-colors text-white/70"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-['Poppins',sans-serif] font-bold text-sm mb-4 text-white">
                Quick Links
              </h4>
              <ul className="space-y-2.5">
                {NAV_ITEMS.map((item) => (
                  <li key={item}>
                    <a
                      href={`#${item.toLowerCase()}`}
                      className="text-white/60 text-sm hover:text-[#F4B400] transition-colors flex items-center gap-1.5"
                    >
                      <ChevronRight className="w-3.5 h-3.5" /> {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-['Poppins',sans-serif] font-bold text-sm mb-4 text-white">
                Services
              </h4>
              <ul className="space-y-2.5">
                {SERVICES.map(({ title }) => (
                  <li key={title}>
                    <a
                      href="#services"
                      className="text-white/60 text-sm hover:text-[#F4B400] transition-colors flex items-center gap-1.5"
                    >
                      <ChevronRight className="w-3.5 h-3.5" /> {title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-['Poppins',sans-serif] font-bold text-sm mb-4 text-white">
                Contact Us
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "+91 63702 68346", href: "tel:+916370268346" },
                  { label: "+91 80115 84169", href: "tel:+918011584169" },
                  { label: "+91 60009 66614", href: "tel:+916000966614" },
                ].map(({ label, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="flex items-center gap-2.5 text-white/60 text-sm hover:text-[#F4B400] transition-colors"
                    >
                      <Phone className="w-4 h-4 text-[#F4B400] shrink-0" />{" "}
                      {label}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="mailto:maakamakhya9666@gmail.com"
                    className="flex items-center gap-2.5 text-white/60 text-sm hover:text-[#F4B400] transition-colors break-all"
                  >
                    <Mail className="w-4 h-4 text-[#F4B400] shrink-0" />{" "}
                    maakamakhya9666@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-2.5 text-white/60 text-sm">
                  <MapPin className="w-4 h-4 text-[#F4B400] shrink-0 mt-0.5" />{" "}
                  Golaghat District, Assam, India
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/40 text-xs">
            <p>
              &copy; {new Date().getFullYear()} Maa Kamakhya Roofing
              Contractors. All rights reserved.
            </p>
            <p>Strong Roofs. Stronger Trust.</p>
          </div>
        </div>
      </footer>

      {/* ── FLOATING BUTTONS ── */}
      <div className="fixed bottom-6 right-4 flex flex-col gap-3 z-40">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
        >
          <MessageCircle className="w-7 h-7" />
        </a>
        <a
          href={callHref}
          aria-label="Call us now"
          className="w-14 h-14 rounded-full bg-[#D72626] text-white flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
        >
          <Phone className="w-7 h-7" />
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster richColors position="top-right" closeButton />
      <Routes>
        <Route path="/admin/*" element={
          <Suspense fallback={<div>Loading admin...</div>}>
            <AdminApp />
          </Suspense>
        } />
        <Route path="/*" element={<PublicSite />} />
      </Routes>
    </>
  );
}
