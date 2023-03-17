import React, { Component } from "react"
import { button, title, logo, main } from "../styles/index.css"

class Issue extends Component {
    render(): React.ReactNode {
        return (
            <div>
                <h1>What was the issue?</h1>
                <h2>Choose at least one</h2>
                <ul>
                    <li>
                        Bicycle parking is 
                        <strong>not provided</strong>
                    </li>
                    <li>
                        Bicycle parking is
                        <strong>full</strong>
                    </li>
                    <li>
                        Bicycle parking is
                        <strong>damaged</strong>
                    </li>
                    <li>
                        A bicycle is
                        <strong>abandoned</strong>
                    </li>
                    <li>Something else</li>
                </ul>
            </div>
        );
    }
}

export default Issue