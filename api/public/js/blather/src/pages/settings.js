import "pages/css/index.css"
import "moment-timezone"
import { adjustTimezone } from "utils/dateFunctions"
import { DisplayMetaTags } from "utils/metaFunctions"
import {
	changePassword,
	linkTwitter,
	linkYouTube,
	removeTwitter,
	removeYouTube,
	resetPasswordProps,
	setPatreonUsername,
	togglePatreonLoading,
	twitterRequestToken
} from "components/authentication/v1/actions"
import { Provider, connect } from "react-redux"
import { Redirect } from "react-router-dom"
import {
	Button,
	Container,
	Form,
	Header,
	Icon,
	Input,
	Menu,
	Message,
	Segment
} from "semantic-ui-react"
import Moment from "react-moment"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import qs from "query-string"
import React, { Component } from "react"
import store from "store"

class SettingsPage extends Component {
	constructor(props) {
		super(props)
		const currentState = store.getState()
		const parsed = qs.parse(this.props.location.search)

		let activeItem = "basic"
		if (["twitter", "youtube"].indexOf(props.match.params.tab) !== -1) {
			activeItem = props.match.params.tab
		}

		// Get authorization code for Twitter from URL
		if (
			activeItem === "twitter" &&
			parsed.oauth_token &&
			parsed.oauth_verifier &&
			!currentState.user.data.linkedTwitter
		) {
			this.props.linkTwitter({
				bearer: this.props.bearer,
				secret: parsed.oauth_secret,
				token: parsed.oauth_token,
				verifier: parsed.oauth_verifier
			})
		}

		// Get authorization code for YouTube from URL
		if (activeItem === "youtube" && parsed.code && !currentState.user.data.linkedYoutube) {
			this.props.linkYouTube({
				bearer: this.props.bearer,
				code: parsed.code
			})
		}

		this.state = {
			activeItem,
			confirmPassword: "",
			loading: false,
			newPassword: "",
			password: "",
			patreonUsername: this.props.data.patreonUsername
		}

		this.onChangeConfirmPassword = this.onChangeConfirmPassword.bind(this)
		this.onChangeNewPassword = this.onChangeNewPassword.bind(this)
		this.onChangePassword = this.onChangePassword.bind(this)
		this.onChangePatroenUsername = this.onChangePatroenUsername.bind(this)
		this.redirectToUrl = this.redirectToUrl.bind(this)
		this.setPassword = this.setPassword.bind(this)
	}

	componentDidMount() {}

	componentWillReceiveProps(props) {
		if (props.passwordChangeSuccessful) {
			this.setState({
				confirmPassword: "",
				loading: false,
				newPassword: "",
				password: ""
			})
			const self = this
			setTimeout(() => {
				self.props.resetPasswordProps()
			}, 4000)
		}
	}

	handleItemClick = (e, { name }) => {
		if (name === "twitter") {
			this.props.twitterRequestToken({
				bearer: this.props.bearer,
				reset: false
			})
		}
		this.setState({ activeItem: name })
	}

	onChangeConfirmPassword = (e, { value }) => this.setState({ confirmPassword: value })

	onChangeNewPassword = (e, { value }) => this.setState({ newPassword: value })

	onChangePassword = (e, { value }) => this.setState({ password: value })

	onChangePatroenUsername = (e, { value }) => this.setState({ patreonUsername: value })

	redirectToUrl = e => {
		let url = null
		switch (this.state.activeItem) {
			case "twitter":
				url = this.props.data.twitterUrl
				break
			case "youtube":
				url = this.props.data.youtubeUrl
				break
			default:
		}
		if (url) {
			window.open(url, "_self")
		}
	}

	setPassword(e) {
		e.preventDefault()
		this.setState({ loading: true })
		this.props.changePassword({
			bearer: this.props.bearer,
			confirmPassword: this.state.confirmPassword,
			newPassword: this.state.newPassword,
			password: this.state.password
		})
	}

	render() {
		const {
			activeItem,
			confirmPassword,
			loading,
			newPassword,
			password,
			patreonUsername
		} = this.state

		const { bearer, data } = this.props

		const ActiveItemDiv = activeItem => {
			if (activeItem === "basic") {
				const joinDate = adjustTimezone(data.dateCreated)
				return (
					<div className="changePasswordBox">
						<p>
							<b>{data.name}</b>
						</p>
						<p>
							<Icon name="clock" /> Joined{" "}
							<Moment date={joinDate} fromNow interval={60000} />
						</p>
						<Header size="tiny">Change Password</Header>
						<Form
							error={this.props.passwordError}
							loading={
								loading &&
								!this.props.passwordChangeSuccessful &&
								!this.props.passwordError
							}
							onSubmit={this.setPassword}
							success={this.props.passwordChangeSuccessful}
						>
							<Form.Field>
								<Input
									onChange={this.onChangePassword}
									placeholder="Current password"
									type="password"
									value={password}
								/>
							</Form.Field>
							<Form.Field>
								<Input
									onChange={this.onChangeNewPassword}
									placeholder="New Password"
									type="password"
									value={newPassword}
								/>
							</Form.Field>
							<Form.Field>
								<Input
									onChange={this.onChangeConfirmPassword}
									placeholder="Confirm Password"
									type="password"
									value={confirmPassword}
								/>
							</Form.Field>
							<Message error content={this.props.passwordErrorMsg} />
							<Message
								content="Your password has been successfully changed"
								success
							/>
							<Button color="blue" type="submit">
								Submit
							</Button>
						</Form>
					</div>
				)
			}

			if (activeItem === "patreon") {
				return (
					<div>
						<Message
							className="patreonMsg"
							content="Get paid to to do the Lord's work"
							header="Enter your Patreon username"
							icon="patreon"
						/>
						<Form
							onSubmit={() => {
								this.props.togglePatreonLoading()
								this.props.setPatreonUsername({ bearer, patreonUsername })
							}}
						>
							<Form.Field>
								<Input
									fluid
									icon
									onChange={this.onChangePatroenUsername}
									placeholder="Your patreon username"
									value={patreonUsername}
								>
									<input />
									<Icon className="patreonIcon" name="patreon" />
								</Input>
							</Form.Field>
							<Form.Field>
								<Button
									color="blue"
									content="Update"
									disabled={patreonUsername === ""}
									fluid
									loading={this.props.patreonLoading}
								/>
							</Form.Field>
						</Form>
					</div>
				)
			}

			if (activeItem === "twitter") {
				const list = [
					"Basic info. This includes your name, username, and profile picture.",
					"Your tweets. Other users will be able to point out fallacious reasoning. This also allows you to assign fallacies to tweets."
				]

				return (
					<div>
						{data.linkedTwitter ? (
							<div>
								<p className="firstParagraph">
									<Icon name="clock" /> You linked your Twitter account{" "}
									<Moment
										date={adjustTimezone(data.twitterDate)}
										fromNow
										interval={60000}
									/>
								</p>
								<div className="contentWrapper">
									<Button
										as="a"
										color="twitter"
										onClick={e => this.props.removeTwitter(bearer)}
									>
										<Icon name="twitter" /> Remove access
									</Button>
								</div>
							</div>
						) : (
							<div>
								<Message header="What we are requesting" list={list} />
								<p className="firstParagraph">
									<Button color="twitter" onClick={this.redirectToUrl}>
										<Icon name="twitter" /> Link your account
									</Button>
								</p>
							</div>
						)}
					</div>
				)
			}

			if (activeItem === "youtube") {
				const list = [
					"Basic info. This includes your name, username, and profile picture.",
					"Linking your account will allow you to assign fallacies to videos and comments and YouTube."
				]

				return (
					<div>
						{data.linkedYoutube ? (
							<div>
								<p className="firstParagraph">
									<Icon name="clock" /> You linked your YouTube account{" "}
									<Moment
										date={adjustTimezone(data.youtubeDate)}
										fromNow
										interval={60000}
									/>
								</p>
								<div className="contentWrapper">
									<Button
										as="a"
										color="youtube"
										onClick={e => this.props.removeYouTube(bearer)}
									>
										<Icon name="youtube" /> Remove access
									</Button>
								</div>
							</div>
						) : (
							<div>
								<Message header="What we are requesting" list={list} />
								<p className="firstParagraph">
									<Button color="youtube" onClick={this.redirectToUrl}>
										<Icon name="youtube" /> Link your account
									</Button>
								</p>
							</div>
						)}
					</div>
				)
			}
		}

		const SettingsMenu = props => (
			<Menu className="settingsMenu" fluid pointing stackable>
				<Menu.Item
					active={activeItem === "basic"}
					key="basic"
					name="basic"
					onClick={this.handleItemClick}
				/>
				<Menu.Item
					active={activeItem === "twitter"}
					key="twitter"
					name="twitter"
					onClick={this.handleItemClick}
				>
					<Icon className="twitterIcon" name="twitter" /> Twitter
				</Menu.Item>
				<Menu.Item
					active={activeItem === "youtube"}
					key="youtube"
					name="youtube"
					onClick={this.handleItemClick}
				>
					<Icon className="youtubeIcon" name="youtube" /> YouTube
				</Menu.Item>
				<Menu.Item
					active={activeItem === "patreon"}
					key="patreon"
					name="patreon"
					onClick={this.handleItemClick}
				>
					<Icon className="patreonIcon" name="patreon" /> Patreon
				</Menu.Item>
			</Menu>
		)

		return !this.props.authenticated ? (
			<Redirect to="/" />
		) : (
			<Provider store={store}>
				<div className="settingsPage">
					<DisplayMetaTags page="settings" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					<Container className="mainContainer" textAlign="left">
						<Header as="h1">Settings</Header>
						<div className="settingsContent">
							{SettingsMenu(this.props)}
							<Segment>{ActiveItemDiv(activeItem)}</Segment>
						</div>
					</Container>
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

SettingsPage.propTypes = {
	authenticated: PropTypes.bool,
	bearer: PropTypes.string,
	changePassword: PropTypes.func.isRequired,
	data: PropTypes.shape({
		bio: PropTypes.string,
		dateCreated: PropTypes.string,
		email: PropTypes.string,
		name: PropTypes.string,
		id: PropTypes.string,
		img: PropTypes.string,
		linkedTwitter: PropTypes.bool,
		linkedYoutube: PropTypes.bool,
		patreonUsername: PropTypes.string,
		twitterAccessToken: PropTypes.string,
		twitterAccessSecret: PropTypes.string,
		twitterDate: PropTypes.string,
		twitterId: PropTypes.string,
		twitterOauthSecret: PropTypes.string,
		twitterOauthToken: PropTypes.string,
		twitterUrl: PropTypes.string,
		twitterUsername: PropTypes.string,
		youtubeAccessToken: PropTypes.string,
		youtubeDate: PropTypes.string,
		youtubeId: PropTypes.string,
		youtubeRefreshToken: PropTypes.string,
		youtubeUrl: PropTypes.string
	}),
	passwordChangeSuccessful: PropTypes.bool,
	passwordError: PropTypes.bool,
	passwordErrorMsg: PropTypes.string,
	patreonLoading: PropTypes.bool,
	removeTwitter: PropTypes.func,
	removeYouTube: PropTypes.func,
	resetPasswordProps: PropTypes.func,
	setPatreonUsername: PropTypes.func,
	togglePatreonLoading: PropTypes.func
}

SettingsPage.defaultProps = {
	changePassword,
	linkTwitter,
	linkYouTube,
	removeTwitter,
	removeYouTube,
	resetPasswordProps,
	setPatreonUsername,
	togglePatreonLoading,
	twitterRequestToken
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.user,
		...ownProps
	}
}

export default connect(
	mapStateToProps,
	{
		changePassword,
		linkTwitter,
		linkYouTube,
		removeTwitter,
		removeYouTube,
		resetPasswordProps,
		setPatreonUsername,
		togglePatreonLoading,
		twitterRequestToken
	}
)(SettingsPage)
