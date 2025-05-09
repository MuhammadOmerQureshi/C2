import React, {useState, useEffect} from 'react';
import '../styles/Login_screen_style.css';
import '../styles/elements.css';
import {useNavigate} from 'react-router-dom';
import {Formik} from "formik";

const Login_box = () => {
	const [activeSection, setActiveSection] = useState('section1');
	const navigator = useNavigate();

	// this handles the click on a section and prevents closing all tabs leaving one open constantly
	const open_section = (section) => {
		if (activeSection === section)
			return;
		setActiveSection(section);
	};

	// returns true if the passed section is the active section
	const isSectionActive = (section) => {
		return activeSection === section;
	};

	const authenticate = async (password, email) => {
		// Directly navigate to the home screen without checking credentials
		navigator("/home_screen");
	};

	// Add data check...
	const sign_up = async (username, password, email) => {
		try {
			const payload = {username: username, password: password, email: email};
			const response = await fetch(`${process.env.ENDPOINT}/user/signup`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload),
			});

			const data = response.json()
			if (response.ok)
				// open the login tab
				open_section('section1')
			else
				console.log(data.error)
		} catch (error) {
			console.log('Error occurred:', error);
		}
	};

	const [open_password_restore, set_open_password_restore] = useState(false);

	const handle_forgot_click = async (email) => {
		try {
			const payload = {email: email};
			const response = await fetch(`${process.env.ENDPOINT}/user/forgot_password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload),
			});
			if (response.ok)
				set_open_password_restore(true)
				// TODO: here should be the part where we open the next step
			else
				console.log("TODO: here should be a print where the email doesnt exist")
				// TODO: here should be a print where the email doesnt exist
		} catch (error) {
			// TODO: display Recovery Email failed, try again later
		}
	}

	const already_signed_in_this_session = () => {
		const cookies = document.cookie.split(';');
		return cookies.some(cookie => cookie.trim().startsWith("user_id="));
	};

	// const already_signed_in_this_session = () => {
	// 	var cookies = document.cookie.split(';');
	// 	// TODO: maybe add iterator loop if we will have time
	// 	for (var i = 0; i < cookies.length; i++) {
	// 		if (cookies[i].trim().startsWith("user_id="))
	// 			return true
	// 	}
	// 	return false;
	// }

	const reset_password = async (token, password) => {
		try {
			const payload = {password: password};
			const response = await fetch(`${process.env.ENDPOINT}/user/reset_password/${token}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload),
			});
			const data = await response.json();
			if (response.status === 201) {
				console.log(data);
				open_section('section1')
			} else {
				// TODO: display the password reset message error
			}

		} catch (error) {
			console.log('Error occurred:', error);
		}
	};

	useEffect(() => {
		if (already_signed_in_this_session())
			navigator("/home_screen")
	}, []);

	return (
		<div className="main_box" id="login_main">
			<div
				className={`section ${isSectionActive('section1') ? 'active' : ''}`}
				onClick={() => open_section('section1')}
			>
				<p>Login</p>
				{isSectionActive('section1') && (
					<div>
						<Formik
							initialValues={{email: "", password: ''}}
							validate={values => {
								const errors = {};
								if (!values.email)
									errors.email = '\nRequired';
								else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email))
									errors.email = 'Invalid email address';

								if (values.password.length < 8)
									errors.password = 'Password must be at least 8 characters long';

								return errors;
							}}
							onSubmit={(values, {setSubmitting}) => {
								setTimeout(() => {
									authenticate( values.password, values.email).then(() => {
										setSubmitting(false);
									})
									setSubmitting(false);
								}, 200);
							}}
						>
							{({
								  values,
								  errors,
								  touched,
								  handleChange,
								  handleBlur,
								  handleSubmit,
								  isSubmitting,
							}) => (
								<form onSubmit={handleSubmit}>
									<a>E-mail</a>
									<input
										type="email"
										name="email"
										onChange={handleChange}
										onBlur={handleBlur}
										value={values.email}
									/>
									<div className="error-message">
										{errors.email && touched.email && errors.email}
									</div>
									<a>Password</a>
									<input
										type="password"
										name="password"
										onChange={handleChange}
										onBlur={handleBlur}
										value={values.password}
									/>
									<div className="error-message">
										{errors.password && touched.password && errors.password}
									</div>
									<br></br>
									<button type="submit" disabled={isSubmitting}>
										Login
									</button>
								</form>
							)}
						</Formik>
					</div>
				)}
			</div>

			<div
				className={`section ${isSectionActive('section2') ? 'active' : ''}`}
				onClick={() => open_section('section2')}
			>
				<p>sign-up</p>
				{isSectionActive('section2') && (
					<div>
						<Formik
							initialValues={{username: "", email: '', password: '', confirm_password: ''}}
							validate={values => {
								const errors = {};

								if (!values.username)
									errors.username = 'Required';

								if (!values.email)
									errors.email = 'Required';
								else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email))
									errors.email = 'Invalid email address';
								if (!values.password)
									errors.password = 'Required';
								else if (values.password.length < 8)
									errors.password = 'Password must be at least 8 characters long';

								if (values.password !== values.confirm_password)
									errors.confirm_password = 'Passwords do not match';

								return errors;
							}}
							onSubmit={(values, {setSubmitting}) => {
								setTimeout(() => {
									sign_up(values.username, values.password, values.email);
									setSubmitting(false);
								}, 200);
							}}
						>
							{({
								  values,
								  errors,
								  touched,
								  handleChange,
								  handleBlur,
								  handleSubmit,
								  isSubmitting,
							  }) => (
								<form onSubmit={handleSubmit}>
									<a>Username</a>
									<input
										type="username"
										name="username"
										onChange={handleChange}
										onBlur={handleBlur}
										value={values.username}
									/>
									<div className="error-message">
										{errors.username && touched.username && errors.username}
									</div>
									<a>Email</a>
									<input
										type="email"
										name="email"
										onChange={handleChange}
										onBlur={handleBlur}
										value={values.email}
									/>
									<div className="error-message">
										{errors.email && touched.email && errors.email}
									</div>
									<a>Password</a>
									<input
										type="password"
										name="password"
										onChange={handleChange}
										onBlur={handleBlur}
										value={values.password}
									/>
									<div className="error-message">
										{errors.password && touched.password && errors.password}
									</div>
									<a>Confirm password</a>
									<input
										type="password"
										name="confirm_password"
										onChange={handleChange}
										onBlur={handleBlur}
										value={values.confirm_password}
									/>
									<div className="error-message">
										{errors.confirm_password && touched.confirm_password && errors.confirm_password}
									</div>
									<br/>
									<button type="submit" disabled={isSubmitting}>
										Sign-up
									</button>
								</form>
							)}
						</Formik>
					</div>
				)}
			</div>

			<div
				className={`section ${isSectionActive('section3') ? 'active' : ''}`}
				onClick={() => open_section('section3')}
			>
				<p>forgot password</p>
				{isSectionActive('section3') && (
					<>
						{!open_password_restore && (
							<div>
								<div>
									<Formik
										initialValues={{email: ""}}
										validate={values => {
											const errors = {};
											if (!values.email)
												errors.email = '\nRequired';
											else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email))
												errors.email = 'Invalid email address';

											return errors;
										}}
										onSubmit={(values, {setSubmitting}) => {
											setTimeout(() => {
												handle_forgot_click(values.email);
												setSubmitting(false);
											}, 400);
										}}
									>
										{({
											  values,
											  errors,
											  touched,
											  handleChange,
											  handleBlur,
											  handleSubmit,
											  isSubmitting,
										  }) => (
											<form onSubmit={handleSubmit}>
												<a>E-mail</a>
												<input
													type="email"
													name="email"
													onChange={handleChange}
													onBlur={handleBlur}
													value={values.email}
												/>
												<div className="error-message">
													{errors.email && touched.email && errors.email}
												</div>
												<br/>
												<button type="submit" disabled={isSubmitting}>
													Reset password
												</button>
											</form>
										)}
									</Formik>
								</div>
							</div>
						)}
						{open_password_restore && (
							<div>
								<Formik
									initialValues={{password: '', confirm_password: '', token: ''}}
									validate={values => {
										const errors = {};
										if (!values.email)
											errors.email = 'Required';
										else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email))
											errors.email = 'Invalid email address';

										if (!values.password)
											errors.password = 'Required';
										else if (values.password.length < 8)
											errors.password = 'Password must be at least 8 characters long';
										else if (!values.token)
											errors.token = 'Required';

										if (values.password !== values.confirm_password)
											errors.confirm_password = 'Passwords do not match';

										return errors;
									}}
									onSubmit={(values, {setSubmitting}) => {
										setTimeout(() => {
											reset_password(values.token, values.password);
											setSubmitting(false);
										}, 400);
									}}
								>
									{({
										  values,
										  errors,
										  touched,
										  handleChange,
										  handleBlur,
										  handleSubmit,
										  isSubmitting,
									  }) => (
										<form onSubmit={handleSubmit}>
											<a>Password</a>
											<input
												type="password"
												name="password"
												onChange={handleChange}
												onBlur={handleBlur}
												value={values.password}
											/>
											<div className="error-message">
												{errors.password && touched.password && errors.password}
											</div>
											<a>Confirm password</a>
											<input
												type="password"
												name="confirm_password"
												onChange={handleChange}
												onBlur={handleBlur}
												value={values.confirm_password}
											/>
											<div className="error-message">
												{errors.confirm_password && touched.confirm_password && errors.confirm_password}
											</div>
											<a>Token</a>
											<input
												type="token"
												name="token"
												onChange={handleChange}
												onBlur={handleBlur}
												value={values.token}
											/>
											<div className="error-message">
												{errors.token && touched.token && errors.token}
											</div>
											<br/>
											<button type="submit" disabled={isSubmitting}>
												Sign-up
											</button>
										</form>
									)}
								</Formik>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	)
		;
};

export default Login_box;