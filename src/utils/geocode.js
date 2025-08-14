// src/utils/geocode.js
export async function getLocationFromCoordinates(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "YourHighlineApp/1.0",
      },
    });

    if (!res.ok) throw new Error("Reverse geocoding failed");

    const data = await res.json();
    const addr = data.address || {};

    return {
      country: addr.country || "Unknown Country",
      state: addr.state || addr.region || "Unknown State",
      city:
        addr.city ||
        addr.town ||
        addr.village ||
        addr.hamlet ||
        "Unknown City",
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    return {
      country: "Unknown Country",
      state: "Unknown State",
      city: "Unknown City",
    };
  }
}
