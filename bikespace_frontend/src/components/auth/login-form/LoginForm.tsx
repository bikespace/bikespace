import {useState} from 'react';
import {useForm, SubmitHandler} from 'react-hook-form';
import {useSearchParams} from 'next/navigation';

// ...

import styles from './login-form.module.scss';

type LoginInputs = {
  email: string;
  password: string;
};

export function LoginForm() {
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
      console.log(response.json());
    } catch (error) {
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
    </>
  );
}
