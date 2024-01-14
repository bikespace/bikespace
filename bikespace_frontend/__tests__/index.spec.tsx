import React from 'react';
import { render, screen } from '@testing-library/react';
import IndexRoute from '../src/pages/index';

type DataProps = {
    site: {
        siteMetadata: {
            title: string;
        };
    };
};

test('render index page', () => {
    const dataProps = {
        site: {
            siteMetadata: {
                title: "BikeSpace"
            }
        }
    }
    render(<IndexRoute data={dataProps} />);
    expect(screen.getByRole('heading')).toHaveTextContent('BikeSpace')
    expect(screen.getByAltText('BikeSpace Logo'))
    expect(screen.getByRole('button')).toHaveTextContent('Report a parking issue')
})