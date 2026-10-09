const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

    const data = await res.json();
    if (data.success && data.url) {
      return data.url;
    }
    throw new Error(data.message || 'Image upload failed');
  },
};
