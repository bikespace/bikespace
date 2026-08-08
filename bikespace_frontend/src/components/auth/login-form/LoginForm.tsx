import {useForm, SubmitHandler} from 'react-hook-form';

import {useAuthStore} from '@/states/store';
import {useUserQuery} from '@/hooks/use-user-query';

import {SidebarButton} from '@/components/shared-ui/sidebar-button';

// ...

import styles from './login-form.module.scss';

type LoginInputs = {
  email: string;
  password: string;
};

export default function LoginForm() {
  const {authToken, setAuthToken} = useAuthStore(state => ({
    authToken: state.authToken,
    setAuthToken: state.setAuthToken,
  }));

  const userQuery = useUserQuery();

  const f = useForm<LoginInputs>();

  const onSubmit: SubmitHandler<LoginInputs> = async data => {
    try {
      const response = await fetch(
        `${process.env.BIKESPACE_API_URL}/admin/login/?include_auth_token`,
        {
          method: 'POST',
          body: JSON.stringify({
            email: data.email,
            password: data.password,
          }),
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );
      const responseData = await response.json();
      setAuthToken(responseData.response.user.authentication_token);
    } catch (error) {
      // TODO improve error handling and change this fetch to a mutate
      f.setError('root.unexpected', error as Error);
    }
  };

  function handleLogout() {
    setAuthToken(null);
  }

  return authToken ? (
    <>
      <h1>Logged in as {userQuery.data?.username}</h1>
      <SidebarButton onClick={handleLogout}>Log Out</SidebarButton>
    </>
  ) : (
    <>
      <h1>Login</h1>
      <form className={styles.loginForm} onSubmit={f.handleSubmit(onSubmit)}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input {...f.register('email')} />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input type="password" {...f.register('password')} />
        </div>
        <input type="submit" value="Login" />
      </form>
    </>
  );
}
