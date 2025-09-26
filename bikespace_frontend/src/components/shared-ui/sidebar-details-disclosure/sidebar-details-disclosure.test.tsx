import React from 'react';
import {render, screen} from '@testing-library/react';

import {
  SidebarDetailsDisclosure,
  SidebarDetailsContent,
} from './SidebarDetailsDisclosure';

describe('SidebarDetailsDisclosure', () => {
  test('SidebarDetailsDisclosure and SidebarDetailsContent render their children', () => {
    render(
      <SidebarDetailsDisclosure>
        <summary>Test Title</summary>
        <SidebarDetailsContent>Test Content</SidebarDetailsContent>
      </SidebarDetailsDisclosure>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  test('SidebarDetailsDisclosure and SidebarDetailsContent allow additional classes to be added', () => {
    render(
      <SidebarDetailsDisclosure className="added-class-1">
        <summary>Test Title</summary>
        <SidebarDetailsContent className="added-class-2">
          Test Content
        </SidebarDetailsContent>
      </SidebarDetailsDisclosure>
    );

    expect(screen.getByText('Test Title').parentElement).toHaveClass(
      /added-class-1/
    );
    expect(screen.getByText('Test Content')).toHaveClass(/added-class-2/);
  });
});
