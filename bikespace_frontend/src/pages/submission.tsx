import React, { MouseEvent, useState, useEffect } from "react";
import { graphql, PageProps } from "gatsby";
import "../styles/submission.scss";
import { StaticImage } from "gatsby-plugin-image";
import SubmissionProgressBar from "../components/SubmissionProgressBar";
import Submission from "../interfaces/Submission";
import { Issue, Location, Time, Comment, Summary } from "../components/";
import { LocationLatLng } from "../interfaces/Submission";

const orderedComponents = [Issue, Location, Time, Comment, Summary];

const SubmissionRoute = () => {
  const [step, setStep] = useState(0);
  const handleBack = (event: MouseEvent<HTMLButtonElement>) => {
    if (step > 0) {
      setStep(step - 1);
    }
  };
  const handleNext = (event: MouseEvent<HTMLButtonElement>) => {
    if (step < orderedComponents.length - 1) {
      setStep(step + 1);
    }
  };
  const ComponentToLoad = () => {
    switch (orderedComponents[step]) {
      case Issue:
        return (
          <Issue
            submission={submission}
            onSubmissionChanged={handleSubmissionChanged}
          />
        );
      case Location:
        return <Location location={location} onLocationChanged={setLocation} />;
      case Time:
        return <Time submission={submission} onSubmissionChanged={handleSubmissionChanged} />;
      case Comment:
        return <Comment submission={submission} onSubmissionChanged={handleSubmissionChanged} />;
      case Summary:
        return <Summary submission={submission} onSubmissionChanged={handleSubmissionChanged} />;
    }
  };

  const [submission, setSubmission] = useState<Submission>({
    comments: [],
    latitude: 43.6504628,
    longitude: -79.3780052,
  });
  const handleSubmissionChanged = (newSubmission: Submission) => {
    setSubmission(newSubmission);
  };
  const [location, setLocation] = useState<LocationLatLng>({
    latitude: 43.6504628,
    longitude: -79.3780052
  });
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    });
  }, []);

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
            <button className="primary-btn-no-fill" onClick={handleBack}>
              Back
            </button>
            <button className="primary-btn" onClick={handleNext}>
              Next
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default SubmissionRoute;
