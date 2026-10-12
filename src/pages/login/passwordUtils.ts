// Pure password helpers used by the Login page.

export const generateStrongPasswordValue = (): string => {
  const uppercase = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lowercase = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%^&*()_+~";

  let gen = "";
  gen += uppercase[Math.floor(Math.random() * uppercase.length)];
  gen += lowercase[Math.floor(Math.random() * lowercase.length)];
  gen += numbers[Math.floor(Math.random() * numbers.length)];
  gen += symbols[Math.floor(Math.random() * symbols.length)];

  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = 0; i < 12; i++) {
    gen += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle
  return gen.split("").sort(() => 0.5 - Math.random()).join("");
};

// Password Strength Evaluation
export const calculateStrength = (pwd: string) => {
  let score = 0;
  if (pwd.length >= 8) score += 1;
  if (pwd.length >= 12) score += 1;
  if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
  return score;
};



