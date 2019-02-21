import "pages/css/index.css"
import { changeProfilePic, updateAbout } from "components/authentication/v1/actions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { fetchUserData } from "pages/actions/user"
import { Provider, connect } from "react-redux"
import {
	Button,
	Container,
	Dimmer,
	Grid,
	Header,
	Icon,
	Image,
	Label,
	Menu,
	Responsive
} from "semantic-ui-react"
import AboutCard from "components/aboutCard/v1/"
import defaultImg from "images/trump.svg"
import ArchivesList from "components/archivesList/v1/"
import DiscussionsList from "components/discussionsList/v1/"
import Dropzone from "react-dropzone"
import FallaciesList from "components/fallaciesList/v1/"
import ImagePic from "images/image-square.png"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"
import TitleHeader from "components/titleHeader/v1/"
import TrumpImg from "images/trump-white.png"

class UserPage extends Component {
	constructor(props) {
		super(props)
		const tabs = ["discussions", "fallacies", "archives"]
		let tab = props.match.params.tab
		const username = props.match.params.username
		const id = props.match.params.id
		const currentState = store.getState()
		const user = currentState.user
		const authenticated = user.authenticated
		const bearer = user.bearer
		const myUsername = authenticated ? user.data.username : null
		const isMyProfile = username === myUsername

		if (!tabs.includes(tab)) {
			tab = "fallacies"
		}

		this.state = {
			activeItem: tab,
			about: user.data.bio ? user.data.bio : "",
			active: false,
			authenticated,
			bearer,
			editing: false,
			files: [],
			id,
			inverted: true,
			isMyProfile,
			myUsername,
			tab,
			tabs,
			username
		}

		this.props.fetchUserData({
			bearer: bearer,
			username: username
		})

		this.onDrop = this.onDrop.bind(this)
		this.onChangeAbout = this.onChangeAbout.bind(this)
		this.reloadAbout = this.reloadAbout.bind(this)
	}

	onChangeAbout = (e, { value }) => this.setState({ about: value })

	componentWillReceiveProps(newProps) {
		const username = newProps.match.params.username
		if (this.state.username !== username) {
			this.props.fetchUserData({
				bearer: this.state.bearer,
				username: username
			})
		}

		const isMyProfile = username === this.state.myUsername
		let tab = newProps.match.params.tab
		if (!this.state.tabs.includes(tab)) {
			tab = "fallacies"
		}

		this.setState({
			activeItem: tab,
			isMyProfile,
			tab,
			username
		})

		if (isMyProfile) {
			const currentState = store.getState()
			const user = currentState.user
			this.setState({ about: user.data.bio })
		}
	}

	handleItemClick = (e, { name }) => {
		this.setState({ activeItem: name })
		this.props.history.push(`/users/${this.state.username}/${name}`)
	}

	handleHide = () => this.setState({ active: false })
	handleShow = () => this.setState({ active: true })

	onDrop(files) {
		this.setState({ files })
		if (files.length > 0) {
			this.props.changeProfilePic({
				bearer: this.state.bearer,
				file: files[0]
			})
		}
	}

	reloadAbout = () => this.setState({ reaload: !this.state.reload })

	updateAbout = () => {
		this.setState({ editing: false })
		this.props.updateAbout({
			bearer: this.state.bearer,
			bio: this.state.about
		})
	}

	render() {
		const { about, active, activeItem, bearer, id, inverted, isMyProfile } = this.state
		let pic = !this.props.user.img && !this.props.loading ? defaultImg : this.props.user.img
		if (isMyProfile) {
			pic = !this.props.data.img && !this.props.loading ? defaultImg : this.props.data.img
		}

		const AboutSection = props => (
			<AboutCard
				bearer={bearer}
				canEdit={isMyProfile}
				description={isMyProfile ? about : props.user.bio}
				handleReload={this.reloadAbout}
				title="About"
				type="user"
			/>
		)
		const content = (
			<Dropzone className="dropdown" onDrop={this.onDrop}>
				{({ getRootProps, getInputProps }) => (
					<div {...getRootProps()}>
						<input {...getInputProps()} />
						<Header as="h2">Change your pic</Header>
						<Button className="changePicBtn" color="blue" icon>
							<Icon name="image" />
						</Button>
					</div>
				)}
			</Dropzone>
		)
		const ProfilePic = props => {
			if (isMyProfile) {
				return (
					<Dimmer.Dimmable
						as={Image}
						centered
						className={`profilePic ${
							!this.props.user.img && !this.props.loading ? "default" : ""
						}`}
						dimmed={active}
						dimmer={{ active, content, inverted }}
						onError={i => (i.target.src = ImagePic)}
						onMouseEnter={this.handleShow}
						onMouseLeave={this.handleHide}
						rounded
						size="medium"
						src={pic}
					/>
				)
			}
			return (
				<Image
					centered
					className={`profilePic ${
						!this.props.user.img && !this.props.loading ? "default" : ""
					}`}
					onError={i => (i.target.src = ImagePic)}
					rounded
					src={pic}
				/>
			)
		}
		const ShowContent = props => {
			if (props.user.id) {
				switch (activeItem) {
					case "discussions":
						return (
							<DiscussionsList
								emptyMsgContent={`${
									props.user.name
								} hasn't discussed anything yet.`}
								filter={{
									both: true,
									startedBy: props.user.id
								}}
								onUserPage
								source="user"
								userId={props.user.id}
								{...props}
							/>
						)
					case "fallacies":
						return (
							<FallaciesList
								assignedBy={props.user.id}
								emptyMsgContent={`${props.user.name} hasn't assigned any fallacies`}
								fallacyId={id}
								history={props.history}
								icon="sticky note"
								name={props.user.name}
								source="users"
							/>
						)
					case "archives":
						return (
							<ArchivesList
								emptyMsgContent={`${props.user.name} hasn't archived anything yet`}
								id={props.user.id}
							/>
						)
					default:
						return null
				}
			}
		}
		const UserMenu = props => (
			<Menu className="profileMenu" fluid stackable tabular>
				<Menu.Item
					active={activeItem === "fallacies"}
					name="fallacies"
					onClick={this.handleItemClick}
				>
					Fallacies{" "}
					{props.user.fallacyCount > 0 && (
						<Label color="blue">{props.user.fallacyCount}</Label>
					)}
				</Menu.Item>
				<Menu.Item
					active={activeItem === "discussions"}
					name="discussions"
					onClick={this.handleItemClick}
				>
					Discussions{" "}
					{props.user.discussionCount > 0 && (
						<Label color="blue">{props.user.discussionCount}</Label>
					)}
				</Menu.Item>
				<Menu.Item
					active={activeItem === "archives"}
					name="archives"
					onClick={this.handleItemClick}
				>
					Archives{" "}
					{props.user.archiveCount > 0 && (
						<Label color="blue">{props.user.archiveCount}</Label>
					)}
				</Menu.Item>
			</Menu>
		)

		return (
			<Provider store={store}>
				<div className="usersPage">
					<DisplayMetaTags page="users" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					{!this.props.error ? (
						<Container className="mainContainer" textAlign="left">
							<Responsive maxWidth={1024}>
								<Grid>
									<Grid.Row>
										<div>
											<TitleHeader
												subheader={`@${this.props.user.username}`}
												title={this.props.user.name}
											/>
										</div>
									</Grid.Row>
									<Grid.Row className="userContentRow">
										{ProfilePic(this.props)}
										{AboutSection(this.props)}
										{UserMenu(this.props)}
										<Container className="profileContentContainer">
											{ShowContent(this.props)}
										</Container>
									</Grid.Row>
								</Grid>
							</Responsive>

							<Responsive minWidth={1025}>
								<Grid>
									<Grid.Column width={4}>
										{ProfilePic(this.props)}
										{AboutSection(this.props)}
									</Grid.Column>

									<Grid.Column width={12}>
										<TitleHeader
											subheader={`@${this.props.user.username}`}
											title={this.props.user.name}
										/>
										{UserMenu(this.props)}
										<Container className="profileContentContainer">
											{ShowContent(this.props)}
										</Container>
									</Grid.Column>
								</Grid>
							</Responsive>
						</Container>
					) : (
						<Container className="mainContainer" text textAlign="center">
							<Image centered className="trumpImg404" size="medium" src={TrumpImg} />
							<Header size="medium">This user does not exist!</Header>
						</Container>
					)}
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

UserPage.propTypes = {
	changeProfilePic: PropTypes.func,
	error: PropTypes.bool,
	fetchUserData: PropTypes.func,
	loading: PropTypes.bool,
	user: PropTypes.shape({
		archiveCount: PropTypes.number,
		bio: PropTypes.string,
		discussionCount: PropTypes.number,
		emailVerified: PropTypes.bool,
		fallacyCount: PropTypes.number,
		id: PropTypes.number,
		img: PropTypes.string,
		linkedTwitter: PropTypes.bool,
		linkedYoutube: PropTypes.bool,
		name: PropTypes.string,
		username: PropTypes.string
	})
}

UserPage.defaultProps = {
	changeProfilePic: changeProfilePic,
	fetchUserData: fetchUserData,
	loading: true,
	user: {}
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.pageUser,
		...state.user,
		...ownProps
	}
}

export default connect(
	mapStateToProps,
	{
		changeProfilePic,
		fetchUserData,
		updateAbout
	}
)(UserPage)
