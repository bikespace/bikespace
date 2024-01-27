import React from 'react';
import {StaticImage} from 'gatsby-plugin-image';

const feedback_to = 'bikespaceto@gmail.com';
const feedback_subject = 'BikeSpace App Feedback';
const feedback_body = `----------
Please describe your feedback about app.bikespace.ca below. We welcome both positive feedback (e.g. I found x feature useful) and constructive feedback (e.g. y is broken, I wish the app did z).

Especially for constructive feedback, you can help us by letting us know:

- Your browser and platform (e.g. Safari, iPhone)
- If it's a bug, what steps led to the problem
- If it's something you wish the app was able to do, what goal would that feature help you accomplish? (e.g. "I think it would help advocates if you could report issues of x type", or "I wanted to be able to do step y easier on my phone")

Thank you for taking the time to help us make the app better!
----------

Hi BikeSpace team,

`;
const feedback_href = [
  `mailto:${feedback_to}`,
  `?subject=${encodeURIComponent(feedback_subject)}`,
  `&body=${encodeURIComponent(feedback_body)}`,
].join('');

const FeedbackMailTo = () => {
  return (
    <a href={feedback_href}>
      <StaticImage
        height={20}
        style={{marginRight: '0.3rem'}}
        src="../images/envelope-at.svg"
        alt="Email Icon"
      />
      Feedback
    </a>
  );
};

export default FeedbackMailTo;
