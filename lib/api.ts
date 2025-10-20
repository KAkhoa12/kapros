import { API_CONFIG } from '@/config/api';

// Types
export interface ApiResponse<T = unknown> {
 data?: T;
 error?: string;
 message?: string;
}

export interface ModelStatus {
 status: string;
 message?: string;
}

export interface GenerateResponse {
  status: string;
  message: string;
  data: {
    image: string;
  };
}

// Base API function
async function apiCall<T>(
 endpoint: string,
 options: RequestInit = {}
): Promise<ApiResponse<T>> {
 try {
 const url = `${API_CONFIG.API_PATH}${endpoint}`;
 const response = await fetch(url, {
 headers: {
 'Content-Type': 'application/json',
 ...options.headers,
 },
 ...options,
 });

 if (!response.ok) {
 throw new Error(`HTTP error! status: ${response.status}`);
 }

 const data = await response.json();
 return { data };
 } catch (error) {
 return { 
 error: error instanceof Error ? error.message : 'Unknown error occurred' 
 };
 }
}

// Models API
export async function getModels(): Promise<ApiResponse> {
 return apiCall(API_CONFIG.ENDPOINTS.MODELS);
}

// Face2Comic API
export async function getFace2ComicStatus(): Promise<ApiResponse<ModelStatus>> {
 return apiCall(API_CONFIG.ENDPOINTS.FACE2COMIC.STATUS);
}

export async function setupFace2Comic(): Promise<ApiResponse> {
 return apiCall(API_CONFIG.ENDPOINTS.FACE2COMIC.SETUP, {
 method: 'POST',
 });
}

export async function generateFace2Comic(imageBase64: string): Promise<ApiResponse<GenerateResponse>> {
  try {
    // Chuyển đổi base64 thành File object
    const response = await fetch(imageBase64);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });

    const formData = new FormData();
    formData.append('file', file);

    const apiResponse = await fetch(`${API_CONFIG.API_PATH}${API_CONFIG.ENDPOINTS.FACE2COMIC.GENERATE}`, {
      method: 'POST',
      body: formData,
    });

    if (!apiResponse.ok) {
      throw new Error(`HTTP error! status: ${apiResponse.status}`);
    }

    const data = await apiResponse.json();
    return { data };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}

// Comic2Face API
export async function getComic2FaceStatus(): Promise<ApiResponse<ModelStatus>> {
 return apiCall(API_CONFIG.ENDPOINTS.COMIC2FACE.STATUS);
}

export async function setupComic2Face(): Promise<ApiResponse> {
 return apiCall(API_CONFIG.ENDPOINTS.COMIC2FACE.SETUP, {
 method: 'POST',
 });
}

export async function generateComic2Face(file: File): Promise<ApiResponse<GenerateResponse>> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_CONFIG.API_PATH}${API_CONFIG.ENDPOINTS.COMIC2FACE.GENERATE}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
}
