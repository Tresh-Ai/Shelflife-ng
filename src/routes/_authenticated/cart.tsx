import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/cart")({
  beforeLoad: () => { throw redirect({ to: "/dispatch" }); },
});
