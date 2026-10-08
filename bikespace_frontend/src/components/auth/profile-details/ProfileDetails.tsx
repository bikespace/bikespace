import {useUserQuery} from '@/hooks/use-user-query';
import {Spinner} from '@/components/shared-ui/spinner';

import {LoginForm} from '../login-form';

import styles from './profile-details.module.scss';

export default function ProfileDetails() {
  const userQuery = useUserQuery();

  const userFirstAndOrLastName = [
    userQuery.data?.first_name,
    userQuery.data?.last_name,
  ]
    .filter(el => Boolean(el))
    .join(' ');

  return userQuery.isLoading ? (
    <div className={styles.profileDetails}>
      <Spinner className={styles.loadingIndicator} />
    </div>
  ) : userQuery.isSuccess ? (
    <div className={styles.profileDetails}>
      <h2>{userFirstAndOrLastName || userQuery.data?.username}</h2>
      <dl className={styles.userDetails}>
        <div className={styles.userProperty}>
          <dt>Username:</dt>
          <dd>{userQuery.data?.username}</dd>
        </div>
        <div className={styles.userProperty}>
          <dt>Email:</dt>
          <dd>
            {userQuery.data?.email}{' '}
            <span title={userQuery.data?.confirmed_at}>
              ({userQuery.data?.confirmed_at ? 'confirmed' : 'unconfirmed'})
            </span>
          </dd>
        </div>
      </dl>
      <LoginForm />
    </div>
  ) : userQuery.isError ? (
    <div className={styles.profileDetails}>
      <h2>Error fetching user details</h2>
      <p>{`${userQuery.failureReason}`}</p>
      <LoginForm />
    </div>
  ) : (
    <div className={styles.profileDetails}>
      <h2>Login</h2>
      <LoginForm />
    </div>
  );
}

export {ProfileDetails};
