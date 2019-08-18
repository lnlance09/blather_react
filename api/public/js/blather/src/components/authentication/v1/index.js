import "./style.css"
import {
	submitGoogleForm,
	submitLoginForm,
	submitRegistrationForm,
	switchTab,
	twitterRequestToken,
	verifyEmail
} from "./actions"
import { GoogleLogin } from "react-google-login"
import { Provider, connect } from "react-redux"
import { Redirect } from "react-router-dom"
import { Button, Divider, Form, Header, Input, Message, Segment } from "semantic-ui-react"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"

class Authentication extends Component {
	constructor(props) {
		super(props)
		this.state = {
			email: "",
			loadingLogin: false,
			loadingRegistration: false,
			login: this.props.type === "signin",
			loginError: false,
			name: "",
			password: "",
			regEmail: "",
			regPassword: "",
			user: {},
			username: "",
			verificationCode: "",
			verify: false
		}

		this.googleResponse = this.googleResponse.bind(this)
		this.onChangeEmail = this.onChangeEmail.bind(this)
		this.onChangePassword = this.onChangePassword.bind(this)

		this.onRegChangeName = this.onRegChangeName.bind(this)
		this.onRegChangeEmail = this.onRegChangeEmail.bind(this)
		this.onRegChangePassword = this.onRegChangePassword.bind(this)
		this.onRegChangeUsername = this.onRegChangeUsername.bind(this)
		this.onChangeVerificationCode = this.onChangeVerificationCode.bind(this)

		this.onClick = this.onClick.bind(this)
		this.redirectToUrl = this.redirectToUrl.bind(this)
		this.submitLoginForm = this.submitLoginForm.bind(this)
		this.submitRegistrationForm = this.submitRegistrationForm.bind(this)
		this.submitEmailVerificationForm = this.submitEmailVerificationForm.bind(this)
	}

	componentDidMount() {
		this.props.twitterRequestToken({
			reset: true
		})
	}

	googleResponse(e) {
		const accessToken = e.tokenObj.access_token
		const email = e.profileObj.email
		const id = e.profileObj.googleId
		const idToken = e.tokenObj.id_token
		const img = e.profileObj.imageUrl
		const name = e.profileObj.name

		this.props.submitGoogleForm({
			accessToken,
			email,
			id,
			idToken,
			img,
			name
		})
	}

	onClick() {
		this.setState({
			loadingLogin: false,
			loadingRegistration: false,
			login: !this.state.login
		})
		this.props.switchTab(this.state.login)
	}

	onChangeEmail = (e, { value }) => this.setState({ email: value })

	onChangePassword = (e, { value }) => this.setState({ password: value })

	onChangeVerificationCode = (e, { value }) => this.setState({ verificationCode: value })

	onRegChangeEmail = (e, { value }) => this.setState({ regEmail: value })

	onRegChangeName = (e, { value }) => this.setState({ name: value })

	onRegChangePassword = (e, { value }) => this.setState({ regPassword: value })

	onRegChangeUsername = (e, { value }) => this.setState({ username: value })

	redirectToUrl = url => {
		if (url) {
			window.open(url, "_self")
		}
	}

	submitEmailVerificationForm(e) {
		e.preventDefault()
		if (this.state.verificationCode.length > 3) {
			this.props.verifyEmail({
				bearer: this.props.bearer,
				code: this.state.verificationCode
			})
		}
	}

	submitLoginForm() {
		this.setState({ loadingLogin: true })
		if (this.state.email.length > 0 && this.state.password.length > 0) {
			this.props.submitLoginForm({
				email: this.state.email,
				password: this.state.password
			})
		}
	}

	submitRegistrationForm() {
		this.setState({ loadingRegistration: true })
		this.props.submitRegistrationForm({
			email: this.state.regEmail,
			name: this.state.name,
			password: this.state.regPassword,
			username: this.state.username
		})
	}

	render() {
		const {
			email,
			loadingLogin,
			loadingRegistration,
			login,
			name,
			password,
			regEmail,
			regPassword,
			username,
			verificationCode
		} = this.state

		const EmailVerificationForm = props => {
			if (props.verify) {
				return (
					<div>
						<Form onSubmit={this.submitEmailVerificationForm}>
							<Form.Field>
								<Input
									onChange={this.onChangeVerificationCode}
									placeholder="Verification code"
									value={verificationCode}
								/>
							</Form.Field>
							<Button color="green" content="Verify" fluid type="submit" />
						</Form>
					</div>
				)
			}
		}

		const ErrorMsg = props => {
			if (props.loginError && props.loginErrorMsg) {
				return <Message content={props.loginErrorMsg} error />
			}
		}

		const GoogleLoginBtn = (
			<GoogleLogin
				buttonText="Login"
				clientId="208834451570-uhnsvk3tb5cqr6uoipnrl9ks68cmeicp.apps.googleusercontent.com"
				cookiePolicy={"single_host_origin"}
				onFailure={e => console.log(e)}
				onSuccess={this.googleResponse}
				render={renderProps => (
					<Button
						color="google plus"
						content="Continue with Google"
						disabled={renderProps.disabled}
						fluid
						icon="google"
						onClick={renderProps.onClick}
					/>
				)}
			/>
		)

		const HeaderText = props => {
			if (!props.verify) {
				return login ? "Sign In" : "Create an account"
			}
			return "Please verify your email"
		}

		const InfoBox = props => {
			if (!props.verify) {
				return (
					<Segment>
						{RegisterText()}{" "}
						<span className="registerLink" onClick={this.onClick}>
							{RegisterButton()}
						</span>
					</Segment>
				)
			}
		}

		const MainForm = props => {
			if (login && !props.verify) {
				return (
					<Form loading={loadingLogin && !props.loginError}>
						<Form.Field>
							<Input
								onChange={this.onChangeEmail}
								placeholder="Email or username"
								value={email}
							/>
						</Form.Field>
						<Form.Field>
							<Input
								onChange={this.onChangePassword}
								placeholder="Password"
								type="password"
								value={password}
							/>
						</Form.Field>
						<Form.Field>
							<Button
								color="blue"
								content="Login"
								fluid
								onClick={this.submitLoginForm}
								type="submit"
							/>
						</Form.Field>
						<Divider horizontal>Or</Divider>
						<Form.Field>{TwitterLogin(props)}</Form.Field>
						<Form.Field>{GoogleLoginBtn}</Form.Field>
					</Form>
				)
			}

			if (!login && !props.verify) {
				return (
					<Form loading={loadingRegistration && !props.loginError}>
						<Form.Field>
							<Input
								onChange={this.onRegChangeEmail}
								placeholder="Email"
								value={regEmail}
							/>
						</Form.Field>
						<Form.Field>
							<Input
								onChange={this.onRegChangePassword}
								value={regPassword}
								placeholder="Password"
								type="password"
							/>
						</Form.Field>
						<Form.Field>
							<Input
								autoComplete="off"
								onChange={this.onRegChangeName}
								placeholder="Full name"
								value={name}
							/>
						</Form.Field>
						<Form.Field>
							<Input
								onChange={this.onRegChangeUsername}
								placeholder="Username"
								value={username}
							/>
						</Form.Field>
						<Form.Field>
							<Button
								color="blue"
								content="Create an account"
								fluid
								onClick={this.submitRegistrationForm}
								type="submit"
							/>
						</Form.Field>
						<Divider horizontal>Or</Divider>
						<Form.Field>{TwitterLogin(props)}</Form.Field>
						<Form.Field>{GoogleLoginBtn}</Form.Field>
					</Form>
				)
			}
		}

		const RegisterButton = () => (login ? "Create an account" : "Sign in")

		const RegisterText = () => (login ? "New to Blather?" : "Already have an account?")

		const TwitterLogin = props => (
			<Button
				color="twitter"
				content="Continue with Twitter"
				fluid
				icon="twitter"
				onClick={() => this.redirectToUrl(props.data.twitterUrl)}
			/>
		)

		return this.props.data.emailVerified ? (
			<Redirect to="/" />
		) : (
			<Provider store={store}>
				<div className="authComponent">
					<Header as="h1">{HeaderText(this.props)}</Header>
					<Segment>
						{MainForm(this.props)}
						{ErrorMsg(this.props)}
						{EmailVerificationForm(this.props)}
					</Segment>
					{InfoBox(this.props)}
				</div>
			</Provider>
		)
	}
}

Authentication.propTypes = {
	authenticated: PropTypes.bool,
	bearer: PropTypes.string,
	data: PropTypes.shape({
		bio: PropTypes.string,
		dateCreated: PropTypes.string,
		email: PropTypes.string,
		emailVerified: PropTypes.bool,
		fbAccessToken: PropTypes.string,
		fbDate: PropTypes.string,
		fbId: PropTypes.string,
		fbUrl: PropTypes.string,
		name: PropTypes.string,
		id: PropTypes.string,
		img: PropTypes.string,
		linkedFb: PropTypes.bool,
		linkedTwitter: PropTypes.bool,
		linkedYoutube: PropTypes.bool,
		twitterAccessToken: PropTypes.string,
		twitterAccessSecret: PropTypes.string,
		twitterDate: PropTypes.string,
		twitterId: PropTypes.string,
		twitterUrl: PropTypes.string,
		twitterUsername: PropTypes.string,
		username: PropTypes.string,
		youtubeAccessToken: PropTypes.string,
		youtubeDate: PropTypes.string,
		youtubeRefreshToken: PropTypes.string,
		youtubeUrl: PropTypes.string
	}),
	loadingLogin: PropTypes.bool,
	loadingRegistration: PropTypes.bool,
	login: PropTypes.bool,
	loginError: PropTypes.bool,
	loginErrorMsg: PropTypes.string,
	submitGoogleForm: PropTypes.func,
	submitLoginForm: PropTypes.func.isRequired,
	submitRegistrationForm: PropTypes.func.isRequired,
	switchTab: PropTypes.func.isRequired,
	twitterRequestToken: PropTypes.func,
	type: PropTypes.string,
	verificationCode: PropTypes.string,
	verify: PropTypes.bool,
	verifyEmail: PropTypes.func
}

Authentication.defaultProps = {
	login: true,
	submitGoogleForm,
	submitLoginForm,
	submitRegistrationForm,
	switchTab,
	twitterRequestToken,
	verifyEmail
}

const mapStateToProps = (state, ownProps) => ({
	...state.user,
	...ownProps
})

export default connect(
	mapStateToProps,
	{
		submitGoogleForm,
		submitLoginForm,
		submitRegistrationForm,
		switchTab,
		twitterRequestToken,
		verifyEmail
	}
)(Authentication)
