import * as React from "react"
import { graphql, PageProps } from "gatsby"
import { button, title, logo, main } from "../styles/index.css"
import  { Issue, Location, Time, Comment, Summary } from "../components/"

const orderedComponents= [ Issue, Location, Time, Comment, Summary ]
let componentIndex = 0 

const SubmissionRoute = () => {
        
    }
    const ComponentToLoad = orderedComponents[componentIndex]
    const buttonHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        console.log(event.currentTarget.name + " Button clicked!")
        const buttonName = event.currentTarget.name;
        switch (buttonName) {
            case "next":
                componentIndex++;
                console.log("Current component index: " + componentIndex);
                break;
            case "back":
                componentIndex--;
                console.log("Current component index: " + componentIndex);
                break;
        }
    }
    return (
        <div>
            <ComponentToLoad />
            <div>
                <button onClick={buttonHandler} name="back">back</button>
                <button onClick={buttonHandler} name="next">next</button>
            </div>
        </div>
    )
}

export default SubmissionRoute