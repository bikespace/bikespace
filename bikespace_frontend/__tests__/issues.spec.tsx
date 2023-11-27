import React, { useState } from "react";

import { render, screen } from "@testing-library/react"
import Issue from "../src/components/Issue"
import { IssueType } from "../src/interfaces/Submission";

describe('Test test start page', () => {
    test('button text should say Report a parking issue', () => {
        const [issues, setIssues] = React.useState<IssueType[]>([]) 
        render(<Issue issues={issues} onIssuesChanged={setIssues}/>);
    })
})