import React, {useEffect, useRef} from 'react';

import {useStore} from '@/states/store';
import {useSubmissionsQuery} from '@/hooks';
import {useIsMobile} from '@/hooks/use-is-mobile';
import {useSubmissionId} from '@/states/url-params';

import {trackUmamiEvent} from '@/utils';

import {Spinner} from '@/components/shared-ui/spinner';

import {FeedSubmissionItem} from '../feed-submission-item';

import styles from './_SidebarContent.module.scss';

type ItemRef = Record<number, HTMLButtonElement>;

export function SidebarContentFeed() {
  const {submissions, selectFeatureOnMap} = useStore(state => ({
    submissions: state.submissions,
    selectFeatureOnMap: state.ui.map.selectFeature,
  }));
  const [focusedSubmissionId, setFocusedSubmissionId] = useSubmissionId();
  const {isLoading} = useSubmissionsQuery();
  const isMobile = useIsMobile();

  const itemRefs = useRef<ItemRef>({});

  // scroll selected item into view when:
  // - focus changes
  // - submissions change (e.g. more are loaded)
  // - viewport changes from desktop to mobile or vice versa
  useEffect(() => {
    if (!focusedSubmissionId) return;

    itemRefs.current[focusedSubmissionId]?.scrollIntoView();
  }, [focusedSubmissionId, submissions, isMobile]);

  return (
    <>
      <div className={styles.ContentHeading}>
        <h2 className={styles.cardHeading}>Latest Submissions</h2>
      </div>
      <div className={`${styles.ContentCard} ${styles.scrollableCard}`}>
        {[...submissions].reverse().map(submission => (
          <FeedSubmissionItem
            key={submission.id}
            submission={submission}
            isFocused={submission.id === focusedSubmissionId}
            onClick={() => {
              setFocusedSubmissionId(submission.id);
              selectFeatureOnMap(
                submission.id,
                submission.latitude,
                submission.longitude
              );
              trackUmamiEvent('focus_submission', {
                submission_id: submission.id,
              });
            }}
            ref={(element: HTMLButtonElement) => {
              itemRefs.current[submission.id] = element;
            }}
          />
        ))}
        <div className={styles.loadingIndicator}>
          {isLoading ? <Spinner label="Loading submissions..." /> : null}
        </div>
      </div>
    </>
  );
}
