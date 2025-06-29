// utils/deliveryFee.js

function calculateDeliveryFee(distanceKm) {
  let rate;

  if (distanceKm <= 5) rate = 150;
  else if (distanceKm <= 10) rate = 120;
  else if (distanceKm <= 20) rate = 100;
  else if (distanceKm <= 30) rate = 80;
  else if (distanceKm <= 50) rate = 60;
  else if (distanceKm <= 70) rate = 40;
  else rate = 20;

  const fee = Math.ceil(distanceKm * rate);

  // Apply min = 1500 and max = 7000 limits
  return Math.max(1500, Math.min(fee, 7000));
}

module.exports = { calculateDeliveryFee };
