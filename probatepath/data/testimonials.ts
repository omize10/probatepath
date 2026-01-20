export type Testimonial = {
  id: string;
  name: string;
  roleOrLocation: string;
  highlight: string;
  quote: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "executor-vancouver-01",
    name: "Alex M.",
    roleOrLocation: "First time executor, Vancouver BC",
    highlight: "Stopped feeling like I was guessing",
    quote:
      "I had no idea where to start with probate. ProbateDesk broke everything into clear steps and told me exactly what information I needed to gather. I went from a stack of random papers to a complete package that actually made sense.",
  },
  {
    id: "executor-northvan-01",
    name: "Priya S.",
    roleOrLocation: "Executor for a parent, North Vancouver BC",
    highlight: "Made a stressful job feel manageable",
    quote:
      "I was working full time and trying to handle the estate on evenings and weekends. The intake questions were written in normal language and the explanations beside each step helped me understand why things mattered, not just what to type.",
  },
  {
    id: "executor-surrey-01",
    name: "J. Chen",
    roleOrLocation: "Executor of a simple estate, Surrey BC",
    highlight: "Knew which forms I actually needed",
    quote:
      "Before ProbateDesk I kept reading government PDFs and getting lost in them. The system asked targeted questions and then told me which forms applied in my situation. I stopped worrying that I had missed some secret extra form.",
  },
];
