export type ProductId = "campus" | "partner" | "workplace";

export type Product = {
  id: ProductId;
  name: string;
  tagline: string;
  for: string;
  includes: string[];
  price: string;
  icon: string;
  sizeLabel: string;
  sizes: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "campus",
    name: "NariRaksha Campus",
    tagline: "Your first product",
    for: "Colleges, universities and educational institutions.",
    includes: [
      "Free student access to the core guidance platform.",
      "Campus-specific support resources and escalation contacts.",
      "Workshops on digital safety, legal awareness and reporting pathways.",
      "A directory of relevant internal and external support services.",
      "Optional aggregate usage statistics that do not expose individual users.",
    ],
    price: "₹25k–₹60k/year",
    icon: "🎓",
    sizeLabel: "Number of students",
    sizes: ["Under 1,000", "1,000–5,000", "5,000–15,000", "Over 15,000"],
  },
  {
    id: "partner",
    name: "NariRaksha Partner",
    tagline: "For NGOs and community organisations",
    for: "NGOs, women's support groups and community organisations.",
    includes: [
      "Customised support information for the communities they serve.",
      "Malayalam and other relevant language resources.",
      "Evidence-preservation checklists and complaint-drafting tools.",
      "Referral links to qualified professionals and legal-aid services.",
      "Training for frontline support workers.",
    ],
    price: "₹15k–₹50k/year",
    icon: "🤝",
    sizeLabel: "People you support per year",
    sizes: ["Under 500", "500–2,000", "2,000–10,000", "Over 10,000"],
  },
  {
    id: "workplace",
    name: "NariRaksha Workplace",
    tagline: "For employers and corporate partners",
    for: "Employers and corporate partners.",
    includes: [
      "Workplace rights and harassment-prevention education.",
      "Clear information on how to reach the designated complaint channel.",
      "Support and referral resources for employees.",
      "Awareness campaigns and training modules.",
      "Carefully designed, privacy-preserving implementation reporting.",
    ],
    price: "₹60k–₹2L/year",
    icon: "🏢",
    sizeLabel: "Number of employees",
    sizes: ["10–50", "50–250", "250–1,000", "Over 1,000"],
  },
];

export const productById = (id: string | null | undefined) => PRODUCTS.find((p) => p.id === id);
