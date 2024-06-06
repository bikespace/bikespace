import React, {useState, useEffect} from 'react';

import {DashboardPage} from '@/components/dashboard';
import {SubmissionApiPayload} from '@/interfaces/Submission';

export default function DashboardRoute() {
  const [submissions, setSubmissions] = useState<SubmissionApiPayload[]>([]);

  useEffect(() => {
    fetch('https://api-dev.bikespace.ca/api/v2/submissions')
      .then(res => res.json())
      .then(data => {
        setSubmissions(data.submissions);
      });
  }, []);

  return <DashboardPage submissions={submissions} />;
}
