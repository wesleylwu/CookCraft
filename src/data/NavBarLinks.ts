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
    name: "History",
    link: "/history",
  },
  {
    name: "Inventory",
    link: "/inventory",
  },
];

export default navigations;
