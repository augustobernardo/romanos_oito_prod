const isValidPhone = (value: string) => {
  if (!value) return true;
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
};

const formatPhone = (digits: string) => {
  if (!digits) return "";
  const d = digits.replace(/\D/g, "").slice(0, 11);
  const area = d.slice(0, 2);
  const rest = d.slice(2);
  const split = d.length === 11 ? 5 : 4;
  if (!area) return "";
  if (!rest) return `(${area}`;
  const first = rest.slice(0, split);
  const last = rest.slice(split);
  return `(${area}) ${first}${last ? `-${last}` : ""}`;
};

export { isValidPhone, formatPhone };