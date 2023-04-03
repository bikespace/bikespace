import React, { MouseEvent, useState } from "react";
import { graphql, PageProps } from "gatsby";
import "../styles/submission.scss";
import { Issue, Location, Time, Comment, Summary } from "../components/";

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
    const ComponentToLoad = orderedComponents[step];
    return (
        <div id="submission">
            <header id="submission-header">
                <h1>BikeSpace</h1>
            </header>
            <main>
                <div id="main-content">
                    <header>Component index: {step}</header>

                    <ComponentToLoad />

                    <footer>
                        <button
                            className="pill-btn-no-fill"
                            onClick={handleBack}
                        >
                            Back
                        </button>
                        <button className="pill-btn" onClick={handleNext}>
                            Next
                        </button>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default SubmissionRoute;
