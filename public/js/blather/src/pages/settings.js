import "./css/index.css"
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
	twitterRequestToken
} from "components/authentication/v1/actions"
import { Provider, connect } from "react-redux"
import { Redirect } from "react-router-dom"
import {
	Button,
	Container,
	Form,
	Grid,
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
			password: ""
		}

		this.onChangePassword = this.onChangePassword.bind(this)
		this.onChangeNewPassword = this.onChangeNewPassword.bind(this)
		this.onChangeConfirmPassword = this.onChangeConfirmPassword.bind(this)
		this.redirectToUrl = this.redirectToUrl.bind(this)
		this.setPassword = this.setPassword.bind(this)
	}

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

	onChangeConfirmPassword = (e, { value }) => this.setState({ confirmPassword: value })

	onChangeNewPassword = (e, { value }) => this.setState({ newPassword: value })

	onChangePassword = (e, { value }) => this.setState({ password: value })

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

	handleItemClick = (e, { name }) => {
		if (name === "twitter") {
			this.props.twitterRequestToken(this.props.bearer)
		}
		this.setState({ activeItem: name })
	}

	render() {
		const { activeItem, confirmPassword, loading, newPassword, password } = this.state
		const activeItemDiv = activeItem => {
			if (activeItem === "basic") {
				const joinDate = adjustTimezone(this.props.data.dateCreated)
				return (
					<div className="changePasswordBox">
						<p>
							<b>{this.props.data.name}</b>
						</p>
						<p>
							<Icon name="clock" /> Joined{" "}
							<Moment date={joinDate} fromNow interval={60000} />
						</p>
						<Header>Change Password</Header>
						<Form
							error={this.props.passwordError}
							loading={
								loading &&
								!this.props.passwordChangeSuccessful &&
								!this.props.passwordError
							}
							onSubmit={this.setPassword}
							success={this.props.passwordChangeSuccessful}>
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
							<Button className="passwordSubmit" fluid type="submit">
								Submit
							</Button>
						</Form>
					</div>
				)
			}

			if (activeItem === "twitter") {
				const twitterDate = adjustTimezone(this.props.data.twitterDate)
				const list = [
					"Basic info. This includes your name, username, and profile picture.",
					"Your tweets. Other users will be able to point out fallacious reasoning. This also allows you to assign fallacies to tweets."
				]

				return (
					<div>
						{this.props.data.linkedTwitter ? (
							<div>
								<p className="firstParagraph">
									You linked your Twitter account{" "}
									<Moment date={twitterDate} fromNow interval={60000} />
								</p>

								<div style={{ textAlign: "center" }}>
									<Button
										as="a"
										color="twitter"
										compact
										onClick={e => this.props.removeTwitter(this.props.bearer)}>
										<Icon name="twitter" /> Remove access
									</Button>
								</div>
							</div>
						) : (
							<div>
								<Message header="What we are requesting" info list={list} />
								<p className="firstParagraph">
									<Button color="twitter" compact onClick={this.redirectToUrl}>
										<Icon name="twitter" /> Link your account
									</Button>
								</p>
							</div>
						)}
					</div>
				)
			}

			if (activeItem === "youtube") {
				const youtubeDate = adjustTimezone(this.props.data.youtubeDate)
				const list = [
					"Basic info. This includes your name, username, and profile picture.",
					"Linking your account will allow you to assign fallacies to videos and comments and YouTube."
				]

				return (
					<div>
						{this.props.data.linkedYoutube ? (
							<div>
								<p className="firstParagraph">
									You linked your YouTube account{" "}
									<Moment date={youtubeDate} fromNow interval={60000} />
								</p>

								<div style={{ textAlign: "center" }}>
									<Button
										as="a"
										color="youtube"
										compact
										onClick={e => this.props.removeYouTube(this.props.bearer)}>
										<Icon name="youtube" /> Remove access
									</Button>
								</div>
							</div>
						) : (
							<div>
								<Message header="What we are requesting" info list={list} />
								<p className="firstParagraph">
									<Button color="youtube" compact onClick={this.redirectToUrl}>
										<Icon name="youtube" /> Link your account
									</Button>
								</p>
							</div>
						)}
					</div>
				)
			}
		}

		return !this.props.authenticated ? (
			<Redirect to="/" />
		) : (
			<Provider store={store}>
				<div className="settingsPage">
					<DisplayMetaTags page="settings" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					<Container className="mainContainer" textAlign="left">
						<Header as="h1">Settings</Header>
						<Grid>
							<Grid.Column width={4}>
								<Menu borderless className="settingsMenu" fluid vertical>
									<Menu.Item
										name="basic"
										key="basic"
										active={activeItem === "basic"}
										onClick={this.handleItemClick}
									/>
									<Menu.Item
										name="twitter"
										key="twitter"
										active={activeItem === "twitter"}
										onClick={this.handleItemClick}>
										Twitter
										<Icon
											className="twitterIcon"
											inverted={activeItem === "twitter"}
											name="twitter"
										/>
									</Menu.Item>
									<Menu.Item
										name="youtube"
										key="youtube"
										active={activeItem === "youtube"}
										onClick={this.handleItemClick}>
										YouTube
										<Icon
											className="youtubeIcon"
											inverted={activeItem === "youtube"}
											name="youtube"
										/>
									</Menu.Item>
								</Menu>
							</Grid.Column>
							<Grid.Column className="rightSide" width={12}>
								<div className="settingsContent">
									<Segment attached>{activeItemDiv(activeItem)}</Segment>
								</div>
							</Grid.Column>
						</Grid>
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
	removeTwitter: PropTypes.func,
	removeYouTube: PropTypes.func,
	resetPasswordProps: PropTypes.func
}

SettingsPage.defaultProps = {
	changePassword: changePassword,
	removeTwitter: removeTwitter,
	removeYouTube: removeYouTube
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
		twitterRequestToken
	}
)(SettingsPage)
