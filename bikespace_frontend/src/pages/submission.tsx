import React, { useState, useEffect } from "react";
import "../styles/submission.scss";
import { StaticImage } from "gatsby-plugin-image";
import SubmissionProgressBar from "../components/SubmissionProgressBar";
import { Issue, Location, Time, Comment, Summary } from "../components/";
import { IssueType, LocationLatLng, ParkingDuration } from "../interfaces/Submission";

const orderedComponents = [Issue, Location, Time, Comment, Summary];

const SubmissionRoute = () => {
  const [comments, setComments] = useState<IssueType[]>([]);
  const [location, setLocation] = useState<LocationLatLng>({
    // default location is the City Hall
    latitude: 43.653220,
    longitude: -79.384452
  });
  const [parkingDuration, setParkingDuration] = useState<ParkingDuration>(ParkingDuration.Minutes);
  const [date, setDate] = useState<Date>(new Date());
  const [locationLoaded, setLocationLoaded] = useState(false);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      setLocationLoaded(true);
    }, () => {
      setLocationLoaded(true);
    });
  }, []);

  const [step, setStep] = useState(0);
  const handleStepChanged = (i: number) => {
    if (!locationLoaded) { return locationLoaded }

    if (i === -1 && step > 0) {
      setStep(step - 1);
    } else if (i === 1 && step < orderedComponents.length - 1) {
      setStep(step + 1);
    }
  }
  const ComponentToLoad = () => {
    switch (orderedComponents[step]) {
      case Issue:
        return <Issue comments={comments} onCommentsChanged={setComments} />
      case Location:
        return <Location location={location} onLocationChanged={setLocation} />
      case Time:
        return <Time parkingDuration={parkingDuration} onParkingDurationChanged={setParkingDuration} date={date} onDateChanged={setDate}/>;
      case Summary:
        return <Summary />;
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
      </header>
      <main>
        <div id="main-content">
          <header>
            <SubmissionProgressBar step={step} />
          </header>

          <section id="main-content-body">
            { ComponentToLoad() }
          </section>

          <footer>
            <button className="primary-btn-no-fill" onClick={() => handleStepChanged(-1)}>
              Back
            </button>
            <button className="primary-btn" onClick={() => handleStepChanged(1)}>
              Next
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default SubmissionRoute;
