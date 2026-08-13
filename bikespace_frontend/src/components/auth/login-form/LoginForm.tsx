import {useForm, SubmitHandler} from 'react-hook-form';

import {useAuthStore} from '@/states/store';
import {SidebarButton} from '@/components/shared-ui/sidebar-button';

import styles from './login-form.module.scss';

// form field ids should match API fields to ensure proper error handling
type LoginInputs = {
  email: string;
  password: string;
};
const inputKeys = ['email', 'password'];

export default function LoginForm() {
  const {authToken, setAuthToken} = useAuthStore(state => ({
    authToken: state.authToken,
    setAuthToken: state.setAuthToken,
  }));

  const {
    formState: {errors},
    handleSubmit,
    register,
    setError,
  } = useForm<LoginInputs>();

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

      if (response.ok) {
        // save auth token on successful response
        setAuthToken(responseData.response.user.authentication_token);
      } else {
        // display form error(s) from API validation error response
        for (const serverError of Object.entries(
          responseData?.response?.field_errors
        )) {
          const [errorName, errorMessage] = serverError;
          const errorKey = inputKeys.includes(errorName)
            ? errorName
            : 'root.serverError';
          // @ts-expect-error 2345 - TS does not recognize .includes narrowing
          setError(errorKey, {
            message: (errorMessage as string[]).join('; '),
          });
        }
      }
    } catch (error) {
      // display errors when no API validation response is received
      setError('root.serverError', {
        type: 'server',
        message:
          error instanceof Error
            ? error.message
            : 'Login failed. Please try again.',
      });
    }
  };

  function handleLogout() {
    setAuthToken(null);
  }

  const errorList = [
    errors.email ? {key: 'email', message: errors.email?.message} : null,
    errors.password
      ? {key: 'password', message: errors.password?.message}
      : null,
    errors.root?.serverError
      ? {key: 'root.serverError', message: errors.root?.serverError?.message}
      : null,
  ];

  return authToken ? (
    <div className={styles.loginForm}>
      <div className={styles.actionButton}>
        <SidebarButton onClick={handleLogout}>Log Out</SidebarButton>
      </div>
    </div>
  ) : (
    <div className={styles.loginForm}>
      <form className={styles.formArea} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            aria-invalid={errors.email ? 'true' : 'false'}
            aria-describedby={errors.email ? 'error-email' : undefined}
            {...register('email', {required: 'Email is required'})}
          />
        </div>
        <div className={styles.inputGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            aria-invalid={errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'error-password' : undefined}
            {...register('password', {required: 'Password is required'})}
          />
        </div>
        {errorList.map(error =>
          error ? (
            <p
              key={error.key}
              id={`error-${error.key}`}
              className={styles.errorMessage}
            >
              {error.message}
            </p>
          ) : null
        )}
        <div className={styles.actionButton}>
          <SidebarButton type="submit">Login</SidebarButton>
        </div>
      </form>
    </div>
  );
}

export {LoginForm};
