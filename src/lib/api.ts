/**
 * API istekleri için yardımcı fonksiyonlar
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * API isteği için temel yapılandırma
 */
const getHeaders = (isFormData = false) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

/**
 * GET isteği
 */
export const fetchApi = async (endpoint: string) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders()
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        // Auto-logout on 401 (Unauthorized / Banned)
        localStorage.removeItem('token');
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        window.location.href = '/login';
        return; // Stop execution
      }
      throw new Error(`API hatası: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.message.includes('401')) {
      // Catch re-thrown 401s if logic leaks
    }
    console.error(`API isteği başarısız: ${endpoint}`, error);
    throw error;
  }
};

/**
 * POST isteği
 */
export const postApi = async <T>(endpoint: string, data: Record<string, unknown> | FormData) => {
  try {
    const isFormData = data instanceof FormData;

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body: isFormData ? data : JSON.stringify(data)
    });

    if (!response.ok) {
      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
        window.location.href = '/login';
        return null as any;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API hatası: ${response.status}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`API isteği başarısız: ${endpoint}`, error);
    throw error;
  }
};

/**
 * PUT isteği
 */
export const putApi = async <T>(endpoint: string, data: Record<string, unknown>) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API hatası: ${response.status}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`API isteği başarısız: ${endpoint}`, error);
    throw error;
  }
};

/**
 * DELETE isteği
 */
export const deleteApi = async <T>(endpoint: string) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API hatası: ${response.status}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`API isteği başarısız: ${endpoint}`, error);
    throw error;
  }
};
