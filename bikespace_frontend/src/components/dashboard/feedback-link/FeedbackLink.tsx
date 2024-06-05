import React from 'react';

import mailtoIcon from '@/images/envelope-at.svg';

export function FeedbackLink() {
  const feedbackTo = 'bikespaceto@gmail.com';
  const feedbackSubject = 'BikeSpace Dashboard Feedback';
  const feedbackBody = `----------
  Please describe your feedback about dashboard.bikespace.ca below. We welcome both positive feedback (e.g. I found x feature useful) and constructive feedback (e.g. y is broken, I wish the dashboard did z).

  Especially for constructive feedback, you can help us by letting us know:
  - Your browser and platform (e.g. Safari, iPhone)
  - If it's a bug, what steps led to the problem
  - If it's something you wish the dashboard was able to do, what goal would that feature help you accomplish? (e.g. "I wanted to see only issues along street x", or "I wanted to better understand issues of y type")

  Thank you for taking the time to help us make the dashboard better!
  ----------

  Hi BikeSpace team,

  `;

  return (
    <a
      href={`mailto:${feedbackTo}?subject=${encodeURIComponent(
        feedbackSubject
      )}&body=${encodeURIComponent(feedbackBody)}`}
      data-umami-event="mailto-feedback"
      id="mailto-feedback"
    >
      <img src={mailtoIcon} alt="Email Icon" />
      Feedback
    </a>
  );
}
