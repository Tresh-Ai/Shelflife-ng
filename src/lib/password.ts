export type PasswordCheck = { id: string; label: string; ok: boolean };

/** Sign-up password rules: 8+ characters, a letter and a number. */
export function checkPassword(pw: string): PasswordCheck[] {
  return [
    { id: "len", label: "At least 8 characters", ok: pw.length >= 8 },
    { id: "letter", label: "A letter", ok: /[A-Za-z]/.test(pw) },
    { id: "number", label: "A number", ok: /\d/.test(pw) },
  ];
}

export const passwordOk = (pw: string) => checkPassword(pw).every((c) => c.ok);
