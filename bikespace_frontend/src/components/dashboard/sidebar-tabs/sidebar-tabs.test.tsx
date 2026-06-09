import React from 'react';
import {render, screen} from '@testing-library/react';

import {NuqsTestingAdapter} from 'nuqs/adapters/testing';

import {SidebarTabs} from './SidebarTabs';

jest.mock('next/navigation', () => ({
  useRouter() {
    return {};
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    };
  },
}));

describe('SidebarTabs', () => {
  beforeEach(() => {
    render(
      <NuqsTestingAdapter>
        <SidebarTabs />
      </NuqsTestingAdapter>
    );
  });

  test('should render tab labels', () => {
    for (const label of ['Insights', 'Filters', 'Feed', 'Info']) {
      const element = screen.getByText(new RegExp(label));

      expect(element).toBeInTheDocument();
    }
  });
});
