import * as React from "react"
import { graphql, PageProps } from "gatsby"
import { button, title, logo, main } from "../styles/index.css"
import  { Issue, Location, Time, Comment, Summary } from "../components/"

const SubmissionRoute = () => {
    return (
        <div>
            <Issue />
            <div>
                <button>back</button>
                <button>next</button>
            </div>
        </div>
    )
}

export default SubmissionRoute