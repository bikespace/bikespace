import React from 'react';
import {act, cleanup, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {axe, toHaveNoViolations} from 'jest-axe';

import {resetInstallPrompt} from '@/hooks/use-install-prompt';

import {InstallApp} from './InstallApp';

expect.extend(toHaveNoViolations);

const userAgents = {
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
  iosInApp:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0.0',
  android:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  desktop:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
};

function stubBrowser({
  userAgent,
  displayModeStandalone = false,
  navigatorStandalone,
}: {
  userAgent: string;
  displayModeStandalone?: boolean;
  navigatorStandalone?: boolean;
}) {
  jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);
  Object.defineProperty(navigator, 'standalone', {
    value: navigatorStandalone,
    configurable: true,
  });
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: displayModeStandalone,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
}

function fireBeforeInstallPrompt() {
  const event = new Event('beforeinstallprompt', {cancelable: true});
  const prompt = jest.fn().mockResolvedValue(undefined);
  Object.assign(event, {prompt});
  act(() => {
    window.dispatchEvent(event);
  });
  return {event, prompt};
}

function getSlot(container: HTMLElement) {
  return container.querySelector('[data-install-mode]') as HTMLElement;
}

const installButton = {name: 'Install BikeSpace'};
const stepsSummary = 'Add BikeSpace to your home screen';

describe('InstallApp', () => {
  afterEach(() => {
    cleanup();
    resetInstallPrompt();
    jest.restoreAllMocks();
  });

  test('is hidden on desktop', () => {
    stubBrowser({userAgent: userAgents.desktop});
    const {container} = render(<InstallApp />);

    expect(getSlot(container)).toHaveAttribute('data-install-mode', 'hidden');
    expect(getSlot(container)).not.toBeVisible();
    expect(screen.queryByText(stepsSummary)).not.toBeInTheDocument();
  });

  test('stays hidden on desktop when the browser offers to install', () => {
    stubBrowser({userAgent: userAgents.desktop});
    render(<InstallApp />);
    fireBeforeInstallPrompt();

    expect(screen.queryByRole('button', installButton)).not.toBeInTheDocument();
  });

  test.each([
    ['display-mode', {displayModeStandalone: true}],
    ['navigator.standalone', {navigatorStandalone: true}],
  ])('is hidden when already installed (%s)', (_, standalone) => {
    stubBrowser({userAgent: userAgents.ios, ...standalone});
    const {container} = render(<InstallApp />);

    expect(getSlot(container)).toHaveAttribute('data-install-mode', 'hidden');
  });

  test('shows the Share steps on iOS', async () => {
    const user = userEvent.setup();
    stubBrowser({userAgent: userAgents.ios});
    render(<InstallApp />);

    await user.click(screen.getByText(stepsSummary));

    const steps = screen.getAllByRole('listitem');
    expect(steps).toHaveLength(3);
    expect(steps[0]).toHaveTextContent('Tap Share');
    expect(steps[1]).toHaveTextContent('Tap Add to Home Screen');
    expect(steps[2]).toHaveTextContent('then tap Add');
  });

  test('shows the browser menu steps on Android before a prompt is offered', async () => {
    const user = userEvent.setup();
    stubBrowser({userAgent: userAgents.android});
    render(<InstallApp />);

    await user.click(screen.getByText(stepsSummary));

    expect(
      screen.getByText(/choose Install app or Add to Home screen/)
    ).toBeVisible();
  });

  test('asks people in an in-app browser to open a real browser', async () => {
    const user = userEvent.setup();
    stubBrowser({userAgent: userAgents.iosInApp});
    render(<InstallApp />);

    await user.click(screen.getByText(stepsSummary));

    expect(screen.getByText(/open this page in Safari or/)).toBeVisible();
  });

  test('captures the browser prompt and offers an install button', () => {
    stubBrowser({userAgent: userAgents.android});
    render(<InstallApp />);

    const {event} = fireBeforeInstallPrompt();

    expect(event.defaultPrevented).toBe(true);
    expect(screen.getByRole('button', installButton)).toBeVisible();
    expect(screen.queryByText(stepsSummary)).not.toBeInTheDocument();
  });

  test('uses a prompt captured before the component rendered', () => {
    stubBrowser({userAgent: userAgents.android});
    fireBeforeInstallPrompt();

    render(<InstallApp />);

    expect(screen.getByRole('button', installButton)).toBeVisible();
  });

  test('falls back to the steps after the prompt is used', async () => {
    const user = userEvent.setup();
    stubBrowser({userAgent: userAgents.android});
    render(<InstallApp />);
    const {prompt} = fireBeforeInstallPrompt();

    await user.click(screen.getByRole('button', installButton));

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', installButton)).not.toBeInTheDocument();
    expect(screen.getByText(stepsSummary)).toBeVisible();
  });

  test('hides once the app is installed', () => {
    stubBrowser({userAgent: userAgents.android});
    const {container} = render(<InstallApp />);
    fireBeforeInstallPrompt();

    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });

    expect(getSlot(container)).toHaveAttribute('data-install-mode', 'hidden');
    expect(screen.queryByRole('button', installButton)).not.toBeInTheDocument();
  });

  test('keeps the steps open if a prompt arrives while reading them', async () => {
    const user = userEvent.setup();
    stubBrowser({userAgent: userAgents.android});
    render(<InstallApp />);

    await user.click(screen.getByText(stepsSummary));
    await screen.findByText(/choose Install app/);
    fireBeforeInstallPrompt();

    expect(screen.getByText(/choose Install app/)).toBeVisible();
    expect(screen.queryByRole('button', installButton)).not.toBeInTheDocument();
  });

  test('tracks the first opening of the steps only', async () => {
    const user = userEvent.setup();
    stubBrowser({userAgent: userAgents.ios});
    render(<InstallApp />);
    const summary = screen.getByText(stepsSummary);

    expect(summary).toHaveAttribute(
      'data-umami-event',
      'install-app-steps-from-frontpage'
    );
    expect(summary).toHaveAttribute('data-umami-event-platform', 'ios');
    // Umami checks the exact click target, so no nested elements
    expect(summary.children).toHaveLength(0);

    await user.click(summary);

    expect(summary).not.toHaveAttribute('data-umami-event');
  });

  test('tracks clicks on the install button', () => {
    stubBrowser({userAgent: userAgents.android});
    render(<InstallApp />);
    fireBeforeInstallPrompt();

    const button = screen.getByRole('button', installButton);
    expect(button).toHaveAttribute(
      'data-umami-event',
      'install-app-button-from-frontpage'
    );
    expect(button).toHaveAttribute('data-umami-event-platform', 'prompt');
  });

  test('has no accessibility violations with the steps open', async () => {
    const user = userEvent.setup();
    stubBrowser({userAgent: userAgents.ios});
    const {container} = render(<InstallApp />);

    await user.click(screen.getByText(stepsSummary));

    expect(await axe(container)).toHaveNoViolations();
  });

  test('hydrates prerendered HTML without a mismatch', async () => {
    // react-dom/server needs TextEncoder, which jsdom doesn't provide
    Object.assign(global, {TextEncoder: require('util').TextEncoder});
    const {renderToString} = await import('react-dom/server');
    const consoleError = jest.spyOn(console, 'error');
    stubBrowser({userAgent: userAgents.ios});

    const container = document.createElement('div');
    document.body.appendChild(container);
    container.innerHTML = renderToString(<InstallApp />);
    expect(getSlot(container)).toHaveAttribute('data-install-mode', 'pending');

    render(<InstallApp />, {container, hydrate: true});

    expect(getSlot(container)).toHaveAttribute('data-install-mode', 'ios');
    expect(consoleError).not.toHaveBeenCalled();
  });
});
