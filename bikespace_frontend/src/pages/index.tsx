import * as React from "react"
import { graphql, PageProps } from "gatsby"

type DataProps = {
    site: {
        siteMetadata: {
            title: string
        }
    }
}

const IndexRoute = ({ data: {site} }: PageProps<DataProps>) => {
    return (
        <main>
            <h1>{site.siteMetadata.title}</h1>
            <p>Coming soon...</p>
        </main>
    )
}

export default IndexRoute

export const query = graphql`
  {
    site {
        siteMetadata {
            title
        }
    }
  }
`