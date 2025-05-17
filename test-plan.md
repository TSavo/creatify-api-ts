# Plan for Test Files

## Test Approach

We've created a new testing approach using direct mocking of the AvatarApi class, which has proven to be more reliable than the previous approach that used the mockApiClientFactory. Here's how we should handle the existing test files:

### Files to Keep

1. **video-creator-direct-mock.test.ts** (New File)
   - This uses our new direct mocking approach
   - It contains the core functionality tests
   - It's clean, focused, and working reliably
   - This should be the primary test file moving forward

2. **video-creator.test.ts** (Keep for Reference)
   - While this file uses the older approach, it contains more detailed tests
   - We should keep it for reference but mark it as legacy
   - We can add more tests to the direct mock file as needed

3. **video-creator-simple.test.ts** (Delete)
   - This was a transitional test file used to debug the issues
   - It's no longer needed as we've implemented a better solution

### Next Steps

1. **Comment the Legacy Tests**
   - Add a comment to video-creator.test.ts to indicate it's using a legacy approach
   - Explain that video-creator-direct-mock.test.ts is the preferred approach

2. **Add More Tests to Direct Mock File**
   - Transfer any unique or important test cases from the old tests to the new approach
   - Ensure complete coverage of the VideoCreator functionality

3. **Apply Same Approach to Other Components**
   - Use the same direct mocking approach for AudioProcessor, BatchProcessor, etc.
   - Create new test files with the "-direct-mock" suffix

This way, we maintain all the important tests while clearly indicating which approach is preferred for future development.
