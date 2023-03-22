import React, { MouseEvent, useState } from "react"
import { graphql, PageProps } from "gatsby"
import { button, title, logo, main } from "../styles/index.css"
import { Issue, Location, Time, Comment, Summary } from "../components/"

const orderedComponents = [Issue, Location, Time, Comment, Summary]

const SubmissionRoute = () => {
    const [component, setComponent] = useState(0)
    const ComponentToLoad = orderedComponents[component]
    const buttonHandler = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const buttonName = event.currentTarget.name;
        switch (buttonName) {
            case "nextButton":
                if (orderedComponents[component + 1]) {
                    setComponent(component + 1);
                    break;
                }
            case "backButton":
                if (orderedComponents[component - 1]) {
                    setComponent(component - 1);
                    break;
                }
        }
    }
    return (
        <div>
            <h1>Component index: {component}</h1>
            <ComponentToLoad />
            <div>
                <button onClick={buttonHandler} name="backButton"
                    disabled={component == 0 ? true : false}>back</button>
                <button onClick={buttonHandler} name="nextButton" 
                    disabled={component == orderedComponents.length - 1 ? true : false}>next</button>
            </div>
        </div>
    )
}

export default SubmissionRoute