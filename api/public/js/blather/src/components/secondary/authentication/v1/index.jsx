import "./style.css"
import {
	logout,
	submitGoogleForm,
	submitLoginForm,
	submitRegistrationForm,
	switchTab,
	twitterRequestToken,
	verifyEmail
} from "./actions"
import { Provider, connect } from "react-redux"
import { Redirect } from "react-router-dom"
import { Button, Divider, Form, Header, Icon, Input, Label, Segment } from "semantic-ui-react"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"
import { Fragment } from "react"

class Authentication extends Component {
	constructor(props) {
		super(props)
		this.state = {
			email: "",
			loadingLogin: false,
			loadingRegistration: false,
			login: this.props.type !== "join",
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
	}

	componentDidMount() {
		this.props.twitterRequestToken({
			reset: true
		})
	}

	googleResponse = e => {
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

	onClick = () => {
		const { login } = this.state
		this.setState(
			{
				loadingLogin: false,
				loadingRegistration: false,
				login: !login
			},
			() => {
				this.props.switchTab(login)
			}
		)
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

	submitEmailVerificationForm = e => {
		const { verificationCode } = this.state
		const bearer = localStorage.getItem("jwtToken")
		this.props.verifyEmail({
			bearer,
			code: verificationCode
		})
	}

	submitLoginForm = () => {
		const { email, password } = this.state
		if (email.length > 0 && password.length > 0) {
			this.setState({ loadingLogin: true }, () => {
				this.props.submitLoginForm({
					callback: () => this.setState({ loadingLogin: false }),
					email,
					password
				})
			})
		}
	}

	submitRegistrationForm = () => {
		this.setState({ loadingRegistration: true }, () => {
			this.props.submitRegistrationForm({
				callback: () => this.setState({ loadingRegistration: false }),
				email: this.state.regEmail,
				name: this.state.name,
				password: this.state.regPassword,
				username: this.state.username
			})
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

		const HeaderText = props => {
			if (!props.verify) {
				return login ? "Sign in" : "Create an account"
			}
			return "Verify your email"
		}

		const MainForm = props => {
			if (props.verify) {
				return (
					<Form inverted onSubmit={this.submitEmailVerificationForm} size="big">
						<Form.Field>
							<Input
								maxLength={4}
								onChange={this.onChangeVerificationCode}
								placeholder="Verification code"
								value={verificationCode}
							/>
						</Form.Field>
						<Form.Field>
							<Button
								color="green"
								content="Verify"
								disabled={verificationCode.length !== 4}
								fluid
								size="big"
								type="submit"
							/>
						</Form.Field>
						<div style={{ height: "1px" }} />
					</Form>
				)
			}

			if (login) {
				return (
					<Form inverted size="big">
						<Form.Field>
							<Input
								autoComplete="off"
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
								content="Sign in"
								fluid
								loading={loadingLogin}
								onClick={this.submitLoginForm}
								size="big"
								type="submit"
							/>
						</Form.Field>
						<div style={{ height: "1px" }} />
					</Form>
				)
			}

			return (
				<Form inverted size="big">
					<Form.Field>
						<Input
							autoComplete="off"
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
							loading={loadingRegistration}
							onClick={this.submitRegistrationForm}
							size="big"
							type="submit"
						/>
					</Form.Field>
					<div style={{ height: "1px" }} />
				</Form>
			)
		}

		const RegisterButton = () => (login ? "Create an account" : "Sign in")

		const RegisterText = () => (login ? "New to Blather?" : "Already have an account?")

		return this.props.data.emailVerified ? (
			<Redirect to="/" />
		) : (
			<Provider store={store}>
				<div className="authComponent">
					<Header as="h1" inverted size="huge">
						{HeaderText(this.props)}
					</Header>
					<Segment inverted>
						<Label
							attached="bottom"
							className={`registerText ${this.props.verify ? "verify" : ""}`}
							size={this.props.verify ? "small" : "big"}
						>
							{this.props.verify ? (
								<span onClick={() => this.props.logout()}>Logout</span>
							) : (
								<Fragment>
									{RegisterText()}{" "}
									<span className="registerLink" onClick={this.onClick}>
										{RegisterButton()}
									</span>
								</Fragment>
							)}
						</Label>
						{MainForm(this.props)}
					</Segment>
					{!this.props.verify && (
						<Fragment>
							<Divider horizontal inverted>
								<Header as="h3" inverted>
									OR
								</Header>
							</Divider>
							<Button
								className="twitterBtn"
								color="twitter"
								fluid
								onClick={() => this.redirectToUrl(this.props.data.twitterUrl)}
								size="big"
							>
								<Icon name="twitter" /> {login ? "Sign in" : "Sign up"} with Twitter
							</Button>
						</Fragment>
					)}
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
	logout: PropTypes.func,
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
	logout,
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

export default connect(mapStateToProps, {
	logout,
	submitGoogleForm,
	submitLoginForm,
	submitRegistrationForm,
	switchTab,
	twitterRequestToken,
	verifyEmail
})(Authentication)
