'use client';

import React, {useState} from 'react';

import {
  InstallMode,
  promptInstall,
  useInstallMode,
} from '@/hooks/use-install-prompt';

import iosShare from '@/assets/icons/ios-share.svg';

import styles from './install-app.module.scss';

function InstallSteps({mode}: Readonly<{mode: InstallMode}>) {
  if (mode === 'in-app') {
    return (
      <p>
        To add BikeSpace to your home screen, open this page in Safari or
        Chrome.
      </p>
    );
  }

  if (mode === 'ios') {
    return (
      <ol>
        <li>
          Tap Share{' '}
          <img src={iosShare.src} alt="" className={styles.shareIcon} />. If you
          don&apos;t see it, tap ••• first.
        </li>
        <li>Tap Add to Home Screen. If it isn&apos;t listed, tap View More.</li>
        <li>Keep Open as Web App on if shown, then tap Add.</li>
      </ol>
    );
  }

  return (
    <p>
      Open your browser&apos;s menu (⋮ or ≡), then choose Install app or Add to
      Home screen.
    </p>
  );
}

function InstallApp() {
  const mode = useInstallMode();
  // Opening the steps can itself make Chrome offer the install prompt, so stay
  // on the steps once someone has opened them rather than swapping them out.
  const [hasOpened, setHasOpened] = useState(false);

  const showButton = mode === 'prompt' && !hasOpened;
  const showSteps = !showButton && mode !== 'pending' && mode !== 'hidden';

  return (
    <div
      className={styles.installApp}
      data-install-mode={mode}
      hidden={mode === 'hidden'}
    >
      {showButton && (
        <button
          type="button"
          className={styles.installButton}
          onClick={promptInstall}
          data-umami-event="install-app-button-from-frontpage"
          data-umami-event-platform={mode}
        >
          Install BikeSpace
        </button>
      )}
      {showSteps && (
        <details
          className={styles.installDetails}
          onToggle={e => {
            if (e.currentTarget.open) setHasOpened(true);
          }}
        >
          {/* text must be the only child: Umami checks the exact click target */}
          <summary
            data-umami-event={
              hasOpened ? undefined : 'install-app-steps-from-frontpage'
            }
            data-umami-event-platform={mode}
          >
            Add BikeSpace to your home screen
          </summary>
          <div className={styles.installSteps}>
            <InstallSteps mode={mode} />
          </div>
        </details>
      )}
    </div>
  );
}

export {InstallApp};
