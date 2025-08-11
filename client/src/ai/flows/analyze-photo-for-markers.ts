// src/ai/flows/analyze-photo-for-markers.ts
'use server';
/**
 * @fileOverview Analyzes a photo of a product for counterfeit markers.
 *
 * - analyzePhotoForMarkers - A function that handles the photo analysis process.
 * - AnalyzePhotoForMarkersInput - The input type for the analyzePhotoForMarkers function.
 * - AnalyzePhotoForMarkersOutput - The return type for the analyzePhotoForMarkers function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'genkit';
const AnalyzePhotoForMarkersInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  productName: z.string().describe('The name of the product being analyzed.'),
  companyName: z.string().describe('The name of the company that manufactures the product.'),
});
export type AnalyzePhotoForMarkersInput = z.infer<typeof AnalyzePhotoForMarkersInputSchema>;
const AnalyzePhotoForMarkersOutputSchema = z.object({
  authenticityScore: z.number().describe('A score from 0-100 indicating the likelihood of authenticity.'),
  detectedIssues: z.array(z.string()).describe('A list of potential counterfeit markers detected in the photo.'),
});
export type AnalyzePhotoForMarkersOutput = z.infer<typeof AnalyzePhotoForMarkersOutputSchema>;
export async function analyzePhotoForMarkers(input: AnalyzePhotoForMarkersInput): Promise<AnalyzePhotoForMarkersOutput> {
  return analyzePhotoForMarkersFlow(input);
}
const prompt = ai.definePrompt({
  name: 'analyzePhotoForMarkersPrompt',
  input: {schema: AnalyzePhotoForMarkersInputSchema},
  output: {schema: AnalyzePhotoForMarkersOutputSchema},
  prompt: `You are an expert in identifying counterfeit agricultural products. You will analyze the provided photo of a product and determine its authenticity based on visual markers.

  Analyze the following product photo for counterfeit markers, such as poor print quality, incorrect packaging, missing holograms, or other inconsistencies. Provide an authenticity score (0-100) and list any detected issues.

  Product Name: {{{productName}}}
  Company Name: {{{companyName}}}
  Photo: {{media url=photoDataUri}}

  Respond in a JSON format.
`,
});
const analyzePhotoForMarkersFlow = ai.defineFlow(
  {
    name: 'analyzePhotoForMarkersFlow',
    inputSchema: AnalyzePhotoForMarkersInputSchema,
    outputSchema: AnalyzePhotoForMarkersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
