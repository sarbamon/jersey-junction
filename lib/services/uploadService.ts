const getNormalizedApiUrl = (): string => {
  const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const cleanUrl = rawUrl.trim().replace(/\/+$/, '');
  if (cleanUrl.endsWith('/api')) {
    return cleanUrl;
  }
  return `${cleanUrl}/api`;
};

const API_URL = getNormalizedApiUrl();

export const uploadService = {
  // Upload base64 image or file to Cloudinary via backend API
  uploadImage: async (fileOrBase64: File | string): Promise<string> => {
    let base64Image = '';

    if (typeof fileOrBase64 === 'string') {
      base64Image = fileOrBase64;
    } else {
      base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(fileOrBase64);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
      });
    }

    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      if (contentType.includes('application/json')) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Upload failed with status ${res.status}`);
      } else {
        const textError = await res.text().catch(() => '');
        throw new Error(`Upload server error (${res.status}): ${textError.slice(0, 100) || 'Unknown error'}`);
      }
    }

    const data = await res.json();
    if (data.success && data.url) {
      return data.url;
    }
    throw new Error(data.message || 'Image upload failed');
  },
};
