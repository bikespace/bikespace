import {useState} from 'react';
import {useForm, SubmitHandler} from 'react-hook-form';
import {useSearchParams} from 'next/navigation';

import {useAuthStore} from '@/states/store';

// ...

import styles from './login-form.module.scss';

type LoginInputs = {
  email: string;
  password: string;
};

export function LoginForm() {
  const {authToken, setAuthToken} = useAuthStore(state => ({
    authToken: state.authToken,
    setAuthToken: state.setAuthToken,
  }));

  const f = useForm<LoginInputs>();

  const onSubmit: SubmitHandler<LoginInputs> = async data => {
    console.log(data, process.env.BIKESPACE_API_URL);
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
      // TODO improve error handling
      f.setError('root.unexpected', error as Error);
    }
  };

  return (
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
      <p>{authToken ? 'Logged in!' : 'Not logged in'}</p>
    </>
  );
}
