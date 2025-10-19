export interface navigation {
  name: string;
  link: string;
}

const navigations: navigation[] = [
  {
    name: "Recipes",
    link: "/recipes",
  },
  {
    name: "Meals",
    link: "/meals",
  },
  {
    name: "Inventory",
    link: "/inventory",
  },
];

export default navigations;
