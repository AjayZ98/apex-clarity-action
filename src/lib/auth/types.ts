export type UserRole = "leadership" | "pmo" | "pm";

export interface DemoUser {
  id: string;
  name: string;
  title: string;
  email: string;
  role: UserRole;
  route: "/leadership" | "/pmo" | "/pm";
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: "priya",
    name: "Priya Raghavan",
    title: "CEO",
    email: "ceo@nexus",
    role: "leadership",
    route: "/leadership",
  },
  {
    id: "arjun",
    name: "Arjun Mehta",
    title: "COO",
    email: "coo@nexus",
    role: "leadership",
    route: "/leadership",
  },
  {
    id: "lakshmi",
    name: "Lakshmi Iyer",
    title: "CFO",
    email: "cfo@nexus",
    role: "leadership",
    route: "/leadership",
  },
  {
    id: "vikram",
    name: "Vikram Shetty",
    title: "PMO Head",
    email: "pmo@nexus",
    role: "pmo",
    route: "/pmo",
  },
  {
    id: "ananya",
    name: "Ananya Desai",
    title: "Project Manager",
    email: "pm@nexus",
    role: "pm",
    route: "/pm",
  },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  leadership: "Leadership",
  pmo: "PMO Head",
  pm: "Project Manager",
};
