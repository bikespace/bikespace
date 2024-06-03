import React from 'react';
import {StaticImage} from 'gatsby-plugin-image';

const feedbackTo = 'bikespaceto@gmail.com';
const feedbackSubject = 'BikeSpace App Feedback';
const feedbackBody = `----------
Please describe your feedback about app.bikespace.ca below. We welcome both positive feedback (e.g. I found x feature useful) and constructive feedback (e.g. y is broken, I wish the app did z).

Especially for constructive feedback, you can help us by letting us know:

- Your browser and platform (e.g. Safari, iPhone)
- If it's a bug, what steps led to the problem
- If it's something you wish the app was able to do, what goal would that feature help you accomplish? (e.g. "I think it would help advocates if you could report issues of x type", or "I wanted to be able to do step y easier on my phone")

Thank you for taking the time to help us make the app better!
----------

Hi BikeSpace team,

`;
const feedbackHref = [
  `mailto:${feedbackTo}`,
  `?subject=${encodeURIComponent(feedbackSubject)}`,
  `&body=${encodeURIComponent(feedbackBody)}`,
].join('');

const FeedbackMailTo = () => {
  return (
    <a href={feedbackHref}>
      <StaticImage
        height={20}
        style={{marginRight: '0.3rem'}}
        src="../images/envelope-at.svg"
        alt="Email Icon"
        data-umami-event="mail-to-button"
      />
      Feedback
    </a>
  );
};

export default FeedbackMailTo;
