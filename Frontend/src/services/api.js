const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000")
  .replace(/\/+$/, "")
  .replace(/\/api$/, "");

export const apiFetch = async (endpoint, options = {}) => {
  const headers = { ...(options.headers || {}) };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem("airbnbToken");
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  const normalizedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const apiEndpoint = normalizedEndpoint.startsWith("/api/")
    ? normalizedEndpoint
    : `/api${normalizedEndpoint}`;
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${apiEndpoint}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Cannot connect to the API at ${API_BASE_URL}. Start the backend or check VITE_API_URL.`,
        { cause: error },
      );
    }
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

export default API_BASE_URL;
