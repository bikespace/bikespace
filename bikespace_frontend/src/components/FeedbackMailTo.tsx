import React from 'react';
import {StaticImage} from 'gatsby-plugin-image';

const FeedbackMailTo = () => {
  return (
    <a href="mailto:bikespaceto@gmail.com?subject=BikeSpace%20App%20Feedback&body=----------%0APlease%20describe%20your%20feedback%20about%20app.bikespace.ca%20below.%20We%20welcome%20both%20positive%20feedback%20(e.g.%20I%20found%20x%20feature%20useful)%20and%20constructive%20feedback%20(e.g.%20y%20is%20broken%2C%20I%20wish%20the%20app%20did%20z).%0A%0AEspecially%20for%20constructive%20feedback%2C%20you%20can%20help%20us%20by%20letting%20us%20know%3A%0A-%20Your%20browser%20and%20platform%20(e.g.%20Safari%2C%20iPhone)%0A-%20If%20it's%20a%20bug%2C%20what%20steps%20led%20to%20the%20problem%0A-%20If%20it's%20something%20you%20wish%20the%20app%20was%20able%20to%20do%2C%20what%20goal%20would%20that%20feature%20help%20you%20accomplish%3F%20(e.g.%20%22I%20think%20it%20would%20help%20advocates%20if%20you%20could%20report%20issues%20of%20x%20type%22%2C%20or%20%22I%20wanted%20to%20be%20able%20to%20do%20step%20y%20easier%20on%20my%20phone%22)%0A%0AThank%20you%20for%20taking%20the%20time%20to%20help%20us%20make%20the%20app%20better!%0A----------%0A%0AHi%20BikeSpace%20team%2C%0A%0A">
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
