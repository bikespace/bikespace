import React, {Suspense} from 'react';

import {SubmissionPage} from '@/components/submission';

// SubmissionForm calls useSearchParams(), which requires a Suspense boundary
// for static export.
const SubmissionRoute = () => {
  return (
    <Suspense>
      <SubmissionPage />
    </Suspense>
  );
};

export default SubmissionRoute;
