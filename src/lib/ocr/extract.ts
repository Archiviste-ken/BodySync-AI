import Tesseract from 'tesseract.js';
import sharp from 'sharp';

/**
 * Preprocesses an image buffer and extracts text using Tesseract.js.
 * @param imageBuffer - The raw image buffer from the uploaded file
 * @returns The raw extracted text
 */
export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  try {
    // 1. Preprocess the image to drastically improve Tesseract accuracy
    const processedBuffer = await sharp(imageBuffer)
      .grayscale() // Remove color noise
      .normalize() // Stretch contrast to the maximum
      .sharpen()   // Sharpen edges of text characters
      .toBuffer();

    // 2. Extract text using Tesseract
    const { data: { text } } = await Tesseract.recognize(
      processedBuffer,
      'eng',
      {
        // Optional: Uncomment to track progress in the server console during large files
        // logger: (m) => console.log(m), 
      }
    );

    return text;
  } catch (error) {
    console.error('OCR Processing Error:', error);
    throw new Error('Failed to extract text from the report. Ensure the image is clear and legible.');
  }
}