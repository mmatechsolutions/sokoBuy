export const getDeliveryFee = (county) => {
  if (!county) return 0;

  const high = ["Nairobi", "Mombasa", "Kisumu", "Nakuru"];
  const medium = ["Kiambu", "Machakos", "Kajiado", "Nyeri", "Murang'a"];

  if (high.includes(county)) return 350;
  if (medium.includes(county)) return 250;

  return 400; // default for upcountry
};
