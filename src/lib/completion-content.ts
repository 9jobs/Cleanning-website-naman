import { servicePages } from "./service-pages";
export const serviceGuides = Object.fromEntries(
  Object.entries(servicePages).map(([slug, page]) => [
    slug,
    {
      focus: page.heading,
      audience: page.description,
      preparation: page.preparation,
      questions: page.questions,
    },
  ]),
);
