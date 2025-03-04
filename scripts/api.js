// Example Doppler API function
async function fetchApiKeys() {
  const response = await fetch("https://api.doppler.com/v3/secrets", {
    method: "GET",
    headers: {
      "Authorization": `Bearer YOUR_DOPPLER_API_KEY`
    }
  });
  const data = await response.json();
  return data;
}
