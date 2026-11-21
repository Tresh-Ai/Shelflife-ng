import { describe, expect, it } from "vitest";
import { passwordOk } from "@/lib/password";

describe("sign-up password rules", () => {
  it("rejects fewer than 8 characters", () => expect(passwordOk("abc123")).toBe(false));
  it("rejects a password with no number", () => expect(passwordOk("abcdefgh")).toBe(false));
  it("rejects a password with no letter", () => expect(passwordOk("12345678")).toBe(false));
  it("accepts 8+ characters with a letter and number", () => expect(passwordOk("farm2026x")).toBe(true));
});
