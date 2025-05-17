import { CreatifyApiClient } from '../client';
import { DYOA } from '../types';

/**
 * Client for interacting with the Creatify DYOA (Design Your Own Avatar) API
 */
export class DyoaApi extends CreatifyApiClient {
  /**
   * Create a DYOA with avatar details
   * @param params Parameters for the DYOA creation
   * @returns Promise resolving to the DYOA response
   */
  async createDyoa(params: DYOA.DyoaParams): Promise<DYOA.DyoaResponse> {
    return this.post<DYOA.DyoaResponse>('/api/dyoa/', params);
  }

  /**
   * Get a DYOA by ID
   * @param id ID of the DYOA
   * @returns Promise resolving to the DYOA details
   */
  async getDyoa(id: string): Promise<DYOA.DyoaResponse> {
    return this.get<DYOA.DyoaResponse>(`/api/dyoa/${id}/`);
  }

  /**
   * Get all DYOAs
   * @returns Promise resolving to an array of DYOAs
   */
  async getDyoaList(): Promise<DYOA.DyoaResponse[]> {
    return this.get<DYOA.DyoaResponse[]>('/api/dyoa/');
  }

  /**
   * Submit a DYOA for review with the chosen photo
   * @param id ID of the DYOA
   * @param params Parameters for the DYOA submission
   * @returns Promise resolving to the updated DYOA details
   */
  async submitDyoaForReview(
    id: string,
    params: DYOA.DyoaSubmitParams
  ): Promise<DYOA.DyoaResponse> {
    return this.post<DYOA.DyoaResponse>(`/api/dyoa/${id}/submit_for_review/`, params);
  }

  /**
   * Delete a DYOA
   * @param id ID of the DYOA to delete
   * @returns Promise resolving to the deletion response
   */
  async deleteDyoa(id: string): Promise<void> {
    return this.delete<void>(`/api/dyoa/${id}/`);
  }

  /**
   * Helper method to create a DYOA and wait for photos to be generated
   * @param params Parameters for the DYOA creation
   * @param pollInterval Interval in milliseconds to check for photo generation (default: 10000)
   * @param maxAttempts Maximum number of polling attempts (default: 30, about 5 minutes)
   * @returns Promise resolving to the DYOA with generated photos
   */
  async createAndWaitForDyoaPhotos(
    params: DYOA.DyoaParams,
    pollInterval = 10000,
    maxAttempts = 30
  ): Promise<DYOA.DyoaResponse> {
    // Create the DYOA
    const response = await this.createDyoa(params);
    
    // Poll for photo generation
    let attempts = 0;
    let result = await this.getDyoa(response.id);
    
    while (
      attempts < maxAttempts &&
      (result.status === 'initializing' || result.photos.length === 0)
    ) {
      // Wait for the specified interval
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      // Check the status again
      result = await this.getDyoa(response.id);
      attempts++;
    }
    
    // Check if we reached max attempts without photos being generated
    if (attempts >= maxAttempts && result.photos.length === 0) {
      throw new Error(`DYOA ${response.id} photos were not generated within the timeout period`);
    }
    
    return result;
  }

  /**
   * Helper method to create a DYOA, wait for photos, submit for review and wait for approval
   * @param createParams Parameters for the DYOA creation
   * @param photoIndex Index of the photo to choose (defaults to 0, the first photo)
   * @param photoGenPollInterval Interval in ms to check for photo generation (default: 10000)
   * @param photoGenMaxAttempts Maximum polling attempts for photos (default: 30)
   * @param reviewPollInterval Interval in ms to check for review completion (default: 60000)
   * @param reviewMaxAttempts Maximum polling attempts for review (default: 60, about 1 hour)
   * @returns Promise resolving to the approved DYOA
   */
  async createSubmitAndWaitForDyoa(
    createParams: DYOA.DyoaParams,
    photoIndex = 0,
    photoGenPollInterval = 10000,
    photoGenMaxAttempts = 30,
    reviewPollInterval = 60000,
    reviewMaxAttempts = 60
  ): Promise<DYOA.DyoaResponse> {
    // Create and wait for photos
    const dyoaWithPhotos = await this.createAndWaitForDyoaPhotos(
      createParams,
      photoGenPollInterval,
      photoGenMaxAttempts
    );
    
    // Ensure we have photos
    if (dyoaWithPhotos.photos.length === 0) {
      throw new Error('No photos were generated for the DYOA');
    }
    
    // Choose the photo (default to the first one if index is out of bounds)
    const safePhotoIndex = Math.min(photoIndex, dyoaWithPhotos.photos.length - 1);
    const chosenPhoto = dyoaWithPhotos.photos[safePhotoIndex];
    
    // Submit for review
    const dyoaSubmitted = await this.submitDyoaForReview(dyoaWithPhotos.id, {
      chosen_photo_id: chosenPhoto.id
    });
    
    // Poll for review completion
    let attempts = 0;
    let result = await this.getDyoa(dyoaSubmitted.id);
    
    while (
      attempts < reviewMaxAttempts &&
      result.status === 'pending'
    ) {
      // Wait for the specified interval
      await new Promise(resolve => setTimeout(resolve, reviewPollInterval));
      
      // Check the status again
      result = await this.getDyoa(dyoaSubmitted.id);
      attempts++;
    }
    
    // Check if we reached max attempts without review completion
    if (attempts >= reviewMaxAttempts && result.status === 'pending') {
      throw new Error(`DYOA ${dyoaSubmitted.id} review did not complete within the timeout period`);
    }
    
    return result;
  }
}