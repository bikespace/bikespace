import React, {useState, useEffect} from 'react';
import {HeadProps, graphql, navigate} from 'gatsby';
import '../styles/submission.scss';
import {StaticImage} from 'gatsby-plugin-image';
import {
  Issue,
  Location,
  Time,
  Comments,
  Summary,
  FeedbackMailTo,
  SubmissionProgressBar,
} from '../components/submission';
import {
  IssueType,
  LocationLatLng,
  ParkingDuration,
  SubmissionStatus,
} from '../interfaces/Submission';

const orderedComponents = [Issue, Location, Time, Comments, Summary];

const SubmissionRoute = () => {
  const [issues, setIssues] = useState<IssueType[]>([]);
  const [location, setLocation] = useState<LocationLatLng>({
    // default location is the City Hall
    latitude: 43.65322,
    longitude: -79.384452,
  });

  const [parkingDuration, setParkingDuration] = useState<ParkingDuration>(
    ParkingDuration.Minutes
  );
  const [dateTime, setDateTime] = useState<Date>(new Date());
  const [locationLoaded, setLocationLoaded] = useState(false);
  const [comments, setComments] = useState('');
  const parkingTime = {date: dateTime, parkingDuration: parkingDuration};
  const submission = {
    issues: issues,
    location: location,
    parkingTime: parkingTime,
    comments: comments,
  };
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationLoaded(true);
      },
      () => {
        setLocationLoaded(true);
      }
    );
  }, []);

  const [step, setStep] = useState(0);
  const handleStepChanged = (i: number) => {
    if (!locationLoaded) {
      return false;
    }

    if (i === -1 && step > 0 && submissionStatus.status === 'summary') {
      setStep(step - 1);
    } else if (i === 1 && step < orderedComponents.length - 1) {
      setStep(step + 1);
    } else if (i === -1 && step > 0 && submissionStatus.status !== 'summary') {
      navigate('/');
    }
    return true;
  };

  const submissionPayload = {
    latitude: submission.location.latitude,
    longitude: submission.location.longitude,
    issues: submission.issues,
    parking_time: submission.parkingTime.date,
    parking_duration: submission.parkingTime.parkingDuration,
    comments: submission.comments,
  };
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({
    status: 'summary',
  });
  async function handleSubmit() {
    try {
      const response = await fetch(
        `${process.env.GATSBY_BIKESPACE_API_URL}/submissions`,
        {
          method: 'POST',
          body: JSON.stringify(submissionPayload),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }
      console.log('result is ' + response.status);
      if (response.status === 201) {
        setSubmissionStatus({status: 'success'});
      }
    } catch (error) {
      if (error instanceof Error) {
        console.log('Error message: ', error.message);
        setSubmissionStatus({status: 'error'});
      } else {
        console.log('unexpected error', error);
        setSubmissionStatus({status: 'error'});
      }
    }
  }

  const ComponentToLoad = () => {
    switch (orderedComponents[step]) {
      case Issue:
        return <Issue issues={issues} onIssuesChanged={setIssues} />;
      case Location:
        return <Location location={location} onLocationChanged={setLocation} />;
      case Time:
        return (
          <Time
            parkingDuration={parkingDuration}
            onParkingDurationChanged={setParkingDuration}
            dateTime={dateTime}
            onDateTimeChanged={setDateTime}
          />
        );
      case Comments:
        return <Comments comments={comments} onCommentsChanged={setComments} />;
      case Summary:
        return (
          <Summary
            submission={submission}
            submissionStatus={submissionStatus}
          />
        );
      default:
        throw new Error('Undefined component set to load');
    }
  };

  return (
    <div id="submission">
      <header id="submission-header">
        <StaticImage
          className="header-logo"
          src="../images/header-logo.svg"
          alt="bike space logo"
        />
        <FeedbackMailTo />
      </header>
      <main>
        <div id="main-content">
          <header>
            <SubmissionProgressBar step={step} />
          </header>

          <section id="main-content-body">{ComponentToLoad()}</section>

          <footer>
            {/* 'Back' button logic */}
            {submissionStatus.status !== 'success' && (
              <button
                className={`primary-btn-no-fill ${step === 0 ? 'hide' : ''}`}
                onClick={() => handleStepChanged(-1)}
                data-umami-event={`back-button-from-${orderedComponents[step].name}`}
              >
                Back
              </button>
            )}

            {/* 'Close' button logic */}
            {submissionStatus.status === 'success' && (
              <button
                className="primary-btn-no-fill"
                onClick={() => navigate('/')}
                data-umami-event="close-button"
              >
                Close
              </button>
            )}
            <button
              className={`primary-btn ${
                step === orderedComponents.length - 1 ? 'display-none' : ' '
              }`}
              onClick={() => handleStepChanged(1)}
              data-umami-event={`next-button-from-${orderedComponents[step].name}`}
            >
              Next
            </button>
            <button
              className={`primary-btn ${
                step === orderedComponents.length - 1 &&
                submissionStatus.status === 'summary'
                  ? ''
                  : 'display-none'
              }`}
              onClick={() => handleSubmit()}
              data-umami-event="submit-issue-button"
            >
              Submit
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default SubmissionRoute;

type DataProps = {
  site: {
    siteMetadata: {
      title: string;
    };
  };
};

export function Head(props: HeadProps<DataProps>) {
  return <title>{props.data.site.siteMetadata.title}</title>;
}

export const query = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
  }
`;
