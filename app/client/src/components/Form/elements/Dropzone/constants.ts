export const mimeTypes = {
  pdf: 'application/pdf',
  csv: 'text/csv',
  jpeg: 'image/jpeg',
  png: 'image/png',
} as const;

// Common MIME types can be found at
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
export const acceptedFiles = {
  pdf: {
    [mimeTypes.pdf] : ['.pdf'],
  },
  csv: {
    [mimeTypes.csv]: ['.csv'],
  },
  images: {
    [mimeTypes.jpeg]: ['.jpeg', '.jpg'],
    [mimeTypes.png]: ['.png'],
  },
} as const;
