export interface Testimonial {
  id: string;
  name: string;
  roleOrLocation: string;
  quote: string;
  highlight?: string;
}

export const testimonials: Testimonial[] = [
  {
    id: "taylor-vancouver",
    name: "Taylor V.",
    roleOrLocation: "Executor in Vancouver, BC",
    highlight: "Clear expectations",
    quote:
      "The team walked me through exactly what signatures were needed and when. I never felt rushed and the checklists kept everything organised.",
  },
  {
    id: "sophie-kelowna",
    name: "Sophie L.",
    roleOrLocation: "Executor in Kelowna, BC",
    highlight: "Fast turnaround",
    quote:
      "I finished the intake in an evening and received filing-ready documents the next day. Every court form was ready to print with no surprises.",
  },
  {
    id: "marcus-saanich",
    name: "Marcus D.",
    roleOrLocation: "Executor in Saanich, BC",
    quote:
      "Probate felt overwhelming until I used the guided intake. The questions were plain language and I could save progress without losing anything.",
  },
  {
    id: "anjali-surrey",
    name: "Anjali P.",
    roleOrLocation: "Executor in Surrey, BC",
    highlight: "Supportive check-ins",
    quote:
      "When I flagged missing documents, they followed up with options and realistic timelines. I appreciated the human support alongside the tech.",
  },
  {
    id: "david-nanaimo",
    name: "David R.",
    roleOrLocation: "Executor in Nanaimo, BC",
    quote:
      "Having the forms, notices, and cover letter assembled in one package removed so much stress. It felt like a concierge service for probate.",
  },
  {
    id: "carmen-richmond",
    name: "Carmen S.",
    roleOrLocation: "Executor in Richmond, BC",
    highlight: "Organised & secure",
    quote:
      "Uploading sensitive documents worried me at first, but everything stayed in Canada and the portal made it easy to see what was still pending.",
  },
  {
    id: "noah-langley",
    name: "Noah K.",
    roleOrLocation: "Executor in Langley, BC",
    quote:
      "The step-by-step intake meant I never wondered what to do next. Each section explained why the court needed the info, which built confidence.",
  },
  {
    id: "mia-victoria",
    name: "Mia J.",
    roleOrLocation: "Executor in Victoria, BC",
    highlight: "Practical guidance",
    quote:
      "They sent a personalised checklist for notarisation and filing. I walked into the registry prepared and the clerk said the forms were complete.",
  },
];
