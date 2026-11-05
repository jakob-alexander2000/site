import type { Contact } from "../../lib/contact";

export const nullContact: Contact = {
  phone: null,
  email: null,
  github: "https://github.com/example.invalid/profile",
};

export const setContact: Contact = {
  phone: "555-0100",
  email: "name@example.com",
  github: "https://github.com/jakob-alexander2000",
};
