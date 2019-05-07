import "pages/css/index.css"
import { changeProfilePic, updateAbout } from "components/authentication/v1/actions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { formatNumber } from "utils/textFunctions"
import { fetchUserData, reset } from "pages/actions/user"
import { Provider, connect } from "react-redux"
import {
	Button,
	Container,
	Dimmer,
	Header,
	Icon,
	Image,
	Label,
	Menu,
	Placeholder,
	Segment
} from "semantic-ui-react"
import defaultImg from "images/trump.svg"
import ArchivesList from "components/archivesList/v1/"
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
		const tabs = ["fallacies", "archives"]
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

		this.props.reset()
		this.props.fetchUserData({
			bearer,
			username
		})

		this.onChangeAbout = this.onChangeAbout.bind(this)
		this.onDrop = this.onDrop.bind(this)
		this.reloadAbout = this.reloadAbout.bind(this)
	}

	componentWillReceiveProps(newProps) {
		const username = newProps.match.params.username
		if (this.state.username !== username) {
			this.props.reset()
			this.props.fetchUserData({
				bearer: this.state.bearer,
				username
			})

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
	}

	handleItemClick = (e, { name }) => {
		this.setState({ activeItem: name })
		this.props.history.push(`/users/${this.state.username}/${name}`)
	}

	handleHide = () => this.setState({ active: false })

	handleShow = () => this.setState({ active: true })

	onChangeAbout = (e, { value }) => this.setState({ about: value })

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
		const { active, activeItem, id, inverted, isMyProfile } = this.state
		const { data, user } = this.props

		let pic = !user.img ? defaultImg : user.img
		if (isMyProfile) {
			pic = !data.img ? defaultImg : data.img
		}

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
					<div className="profilePicContainer">
						<Dimmer.Dimmable
							as={Image}
							bordered
							centered
							circular
							className={`profilePic ${!user.img ? "default" : ""}`}
							dimmed={active}
							dimmer={{ active, content, inverted }}
							onError={i => (i.target.src = ImagePic)}
							onMouseEnter={this.handleShow}
							onMouseLeave={this.handleHide}
							size="medium"
							src={pic}
						/>
					</div>
				)
			}
			return (
				<Image
					bordered
					centered
					circular
					className={`profilePic ${!user.img ? "default" : ""}`}
					onError={i => (i.target.src = ImagePic)}
					src={pic}
				/>
			)
		}

		const ShowContent = ({ props }) => {
			if (props.user.id) {
				switch (activeItem) {
					case "archives":
						return <ArchivesList history={props.history} id={props.user.id} />

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

					default:
						return null
				}
			}
			return null
		}

		const UserMenu = props => (
			<Menu className="profileMenu" fluid stackable>
				<Menu.Item
					active={activeItem === "fallacies"}
					name="fallacies"
					onClick={this.handleItemClick}
				>
					Fallacies{" "}
					{user.fallacyCount > 0 && (
						<Label color="blue" horizontal>
							{formatNumber(user.fallacyCount)}
						</Label>
					)}
				</Menu.Item>
				<Menu.Item
					active={activeItem === "archives"}
					name="archives"
					onClick={this.handleItemClick}
				>
					Archives{" "}
					{user.archiveCount > 0 && (
						<Label color="blue" horizontal>
							{formatNumber(user.archiveCount)}
						</Label>
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
							{this.props.user.id ? (
								<div>{ProfilePic(this.props)}</div>
							) : (
								<Container textAlign="center">
									<Placeholder className="profilePicPlaceholder">
										<Placeholder.Image square />
									</Placeholder>
								</Container>
							)}
							<div className="userHeaderSection">
								<TitleHeader subheader={`@${user.username}`} title={user.name} />
							</div>

							{UserMenu(this.props)}
							<Container className="profileContentContainer">
								<Segment basic className="profileContentSegment">
									<ShowContent props={this.props} />
								</Segment>
							</Container>
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
	reset: PropTypes.func,
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
	changeProfilePic,
	fetchUserData,
	reset,
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
		reset,
		updateAbout
	}
)(UserPage)
