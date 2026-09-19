import React, {useEffect, useMemo, useRef, useState} from 'react';

import {useStore} from '@/states/store';
import {useSubmissionsQuery} from '@/hooks';
import {useIsMobile} from '@/hooks/use-is-mobile';

import {trackUmamiEvent} from '@/utils';

import {SidebarButton} from '@/components/shared-ui/sidebar-button';
import {Spinner} from '@/components/shared-ui/spinner';

import {FeedSubmissionItem} from '../feed-submission-item';

import styles from './_SidebarContent.module.scss';

type ItemRef = Record<number, HTMLButtonElement>;

export const FEED_PAGE_SIZE = 50;

export function SidebarContentFeed() {
  const {submissions, selectedSubmission, setSelectedSubmission} = useStore(
    state => ({
      submissions: state.submissions,
      selectedSubmission: state.ui.submissions.selectedSubmission,
      setSelectedSubmission: state.ui.submissions.setSelectedSubmission,
    })
  );
  const {isLoading} = useSubmissionsQuery();
  const isMobile = useIsMobile();

  const itemRefs = useRef<ItemRef>({});
  const [visibleCount, setVisibleCount] = useState(FEED_PAGE_SIZE);
  const newestSubmissions = useMemo(
    () => [...submissions].reverse(),
    [submissions]
  );
  const visibleSubmissions = newestSubmissions.slice(0, visibleCount);
  const hasMoreSubmissions = visibleCount < newestSubmissions.length;

  useEffect(() => {
    setVisibleCount(FEED_PAGE_SIZE);
  }, [submissions]);

  useEffect(() => {
    if (!selectedSubmission) return;

    const selectedIndex = newestSubmissions.findIndex(
      submission => submission.id === selectedSubmission
    );
    if (selectedIndex < 0) return;

    const requiredCount =
      Math.ceil((selectedIndex + 1) / FEED_PAGE_SIZE) * FEED_PAGE_SIZE;
    setVisibleCount(currentCount => Math.max(currentCount, requiredCount));
  }, [selectedSubmission, newestSubmissions]);

  // scroll selected item into view when:
  // - focus changes
  // - submissions change (e.g. more are loaded)
  // - viewport changes from desktop to mobile or vice versa
  useEffect(() => {
    if (!selectedSubmission) return;

    itemRefs.current[selectedSubmission]?.scrollIntoView();
  }, [selectedSubmission, submissions, isMobile, visibleCount]);

  return (
    <>
      <div className={styles.ContentHeading}>
        <h2 className={styles.cardHeading}>Latest Submissions</h2>
      </div>
      <div
        className={`${styles.ContentCard} ${styles.scrollableCard}`}
        data-testid="submissions-feed"
      >
        {visibleSubmissions.map(submission => (
          <FeedSubmissionItem
            key={submission.id}
            submission={submission}
            isFocused={submission.id === selectedSubmission}
            onClick={() => {
              setSelectedSubmission(submission.id);
              trackUmamiEvent('focus_submission', {
                submission_id: submission.id,
              });
            }}
            ref={(element: HTMLButtonElement) => {
              itemRefs.current[submission.id] = element;
            }}
          />
        ))}
        {hasMoreSubmissions ? (
          <div className={styles.loadMore}>
            <SidebarButton
              type="button"
              onClick={() => setVisibleCount(count => count + FEED_PAGE_SIZE)}
            >
              Load more submissions
            </SidebarButton>
          </div>
        ) : null}
        <div className={styles.loadingIndicator}>
          {isLoading ? <Spinner label="Loading submissions..." /> : null}
        </div>
      </div>
    </>
  );
}
