import * as React from "react";
import { graphql, PageProps, navigate } from "gatsby";
import { button, title, logo, main, mainContent } from "../styles/index.css";
import { StaticImage } from "gatsby-plugin-image";

type DataProps = {
    site: {
        siteMetadata: {
            title: string;
        };
    };
};

const IndexRoute = ({ data: { site } }: PageProps<DataProps>) => {
    return (
        <main className={main}>
            <div className={mainContent}>
                <h1 className={title}>{site.siteMetadata.title}</h1>
                <StaticImage
                    className={logo}
                    src="../images/bikespace-logo.svg"
                    alt="BikeSpace Logo"
                />
                <button
                    className={button}
                    onClick={() => {
                        navigate("/submission");
                    }}
                >
                    Report a parking issue
                </button>
            </div>
        </main>
    );
};

export default IndexRoute;

export const query = graphql`
    {
        site {
            siteMetadata {
                title
            }
        }
    }
`;
