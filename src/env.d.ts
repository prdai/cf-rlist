/// <reference types="astro/client" />

interface Env {
  ADMIN_PASSWORD_HASH: string;
  SESSION_SECRET: string;
}

declare namespace App {
  interface Locals {
    authed: boolean;
  }
}
