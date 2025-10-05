import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts the image path from an S3 URL
 * Example input: https://s3.eu-north-1.amazonaws.com/pgroom2.0/PropertyImages/2cb627f1-b523-4e09-a950-6edc20f05d0f-_.jpeg?X-Amz-Algorithm=...
 * Example output: PropertyImages/2cb627f1-b523-4e09-a950-6edc20f05d0f-_.jpeg
 */
export function extractImagePathFromS3Url(url: string): string | null {
  try {
    if (!url) return null;

    // Parse the URL to get the pathname
    const urlObj = new URL(url);

    // Get the pathname (e.g., /pgroom2.0/PropertyImages/2cb627f1-b523-4e09-a950-6edc20f05d0f-_.jpeg)
    const pathname = urlObj.pathname;

    // Split the pathname by '/' and remove empty segments
    const segments = pathname.split('/').filter(segment => segment.length > 0);

    // If we have at least 2 segments (bucket name and image path)
    if (segments.length >= 2) {
      // Return everything after the bucket name (segments[0])
      return segments.slice(1).join('/');
    }

    return null;
  } catch (error) {
    console.error('Error extracting image path from S3 URL:', error);
    return null;
  }
}
