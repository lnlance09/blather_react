import { changeProfilePic, updateAbout } from "components/secondary/authentication/v1/actions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { fetchUserData, reset } from "redux/actions/user"
import { Provider, connect } from "react-redux"
import {
	Button,
	Dimmer,
	Form,
	Grid,
	Header,
	Icon,
	Image,
	Menu,
	Placeholder,
	TextArea
} from "semantic-ui-react"
import defaultImg from "images/avatar/large/steve.jpg"
import DefaultLayout from "layouts"
import ArchivesList from "components/secondary/lists/archivesList/v1/"
import Dropzone from "react-dropzone"
import FallaciesList from "components/secondary/lists/fallaciesList/v1/"
import ImagePic from "images/images/image-square.png"
import PropTypes from "prop-types"
import React, { Component, Fragment } from "react"
import store from "store"
import TitleHeader from "components/primary/titleHeader/v1/"
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
			inverted: false,
			isMyProfile,
			myUsername,
			tab,
			tabs,
			username
		}

		this.props.reset()
		this.props.fetchUserData({
			bearer,
			callback: about => this.setState({ about }),
			username
		})
	}

	componentDidUpdate(prevProps) {
		if (prevProps !== this.props) {
			const username = this.props.match.params.username
			if (this.state.username !== username) {
				this.props.reset()
				this.props.fetchUserData({
					bearer: this.state.bearer,
					username
				})
			}

			const isMyProfile = username === this.state.myUsername
			let tab = this.props.match.params.tab
			if (!this.state.tabs.includes(tab)) {
				tab = "fallacies"
			}

			if (this.state.username !== username || this.state.tab !== tab) {
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
	}

	handleItemClick = (e, { name }) => {
		this.setState({ activeItem: name })
		this.props.history.push(`/users/${this.state.username}/${name}`)
	}

	handleHide = () => this.setState({ active: false })

	handleShow = () => this.setState({ active: true })

	onChangeAbout = (e, { value }) => this.setState({ about: value })

	onDrop = files => {
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
		this.props.updateAbout({
			bearer: this.state.bearer,
			bio: this.state.about,
			callback: () =>
				this.setState({
					editing: false
				})
		})
	}

	render() {
		const { about, active, activeItem, editing, id, inverted, isMyProfile } = this.state
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
						<Header as="h2" inverted>
							Change your pic
						</Header>
						<Button className="changePicBtn" color="blue" icon inverted>
							<Icon name="image" />
						</Button>
					</div>
				)}
			</Dropzone>
		)

		const ProfilePic = () => {
			if (isMyProfile) {
				return (
					<Dimmer.Dimmable
						as={Image}
						centered
						circular
						className={`profilePic ${!user.img ? "default" : ""}`}
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
					circular
					className={`profilePic ${!user.img ? "default" : ""}`}
					onError={i => (i.target.src = ImagePic)}
					rounded
					src={pic}
				/>
			)
		}

		const ShowContent = props => {
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
								icon="warning sign"
								itemsPerRow={2}
								name={props.user.name}
								size="large"
								source="users"
							/>
						)

					default:
						return null
				}
			}
			return null
		}

		return (
			<Provider store={store}>
				<div className="usersPage">
					<DisplayMetaTags page="users" props={this.props} state={this.state} />

					<DefaultLayout
						activeItem={isMyProfile ? "profile" : ""}
						containerClassName="usersPage"
						history={this.props.history}
					>
						{!this.props.error ? (
							<Fragment>
								<Grid>
									<Grid.Column textAlign="left" width={4}>
										{this.props.user.id ? (
											<div>{ProfilePic()}</div>
										) : (
											<Placeholder className="profilePicPlaceholder" inverted>
												<Placeholder.Image square />
											</Placeholder>
										)}
									</Grid.Column>
									<Grid.Column textAlign="left" width={12}>
										<div className="userHeaderSection">
											{this.props.user.id && (
												<Fragment>
													<TitleHeader
														subheader={
															<div>
																@{user.username}{" "}
																{isMyProfile && (
																	<Button
																		compact
																		color={
																			editing ? "red" : "blue"
																		}
																		content={
																			editing
																				? "Cancel"
																				: "Edit"
																		}
																		onClick={() =>
																			this.setState({
																				editing: !editing
																			})
																		}
																		size="mini"
																		style={{
																			marginLeft: "6px"
																		}}
																	/>
																)}{" "}
															</div>
														}
														textAlign="left"
														title={
															<div>
																{user.name}{" "}
																{isMyProfile && (
																	<Icon
																		inverted
																		name="setting"
																		onClick={() =>
																			this.props.history.push(
																				"/settings"
																			)
																		}
																		style={{
																			cursor: "pointer",
																			float: "right"
																		}}
																	/>
																)}
															</div>
														}
													/>
													{isMyProfile && editing ? (
														<Form
															inverted
															style={{ marginTop: "15px" }}
														>
															<TextArea
																onChange={(e, { value }) =>
																	this.setState({
																		about: value
																	})
																}
																placeholder="Write something about yourself"
																value={about}
															/>
															<Button
																color="blue"
																content="Edit"
																fluid
																onClick={() => this.updateAbout()}
																style={{ marginTop: "10px" }}
															/>
														</Form>
													) : (
														<Header as="p" inverted size="small">
															{about}
														</Header>
													)}
												</Fragment>
											)}
										</div>
									</Grid.Column>
								</Grid>

								{this.props.user.id && (
									<Fragment>
										<Menu
											inverted
											pointing
											secondary
											size="big"
											style={{ marginTop: "40px" }}
										>
											<Menu.Item
												active={activeItem === "fallacies"}
												name="fallacies"
												onClick={this.handleItemClick}
											>
												Fallacies
											</Menu.Item>
											<Menu.Item
												active={activeItem === "archives"}
												name="archives"
												onClick={this.handleItemClick}
											>
												Archives
											</Menu.Item>
										</Menu>

										{ShowContent(this.props)}
									</Fragment>
								)}
							</Fragment>
						) : (
							<Fragment>
								<Image
									centered
									className="trumpImg404"
									size="medium"
									src={TrumpImg}
								/>
								<Header inverted size="large" textAlign="center">
									This user does not exist!
								</Header>
							</Fragment>
						)}
					</DefaultLayout>
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
	updateAbout: PropTypes.func,
	user: PropTypes.shape({
		archiveCount: PropTypes.number,
		bio: PropTypes.string,
		dateCreated: PropTypes.string,
		discussionCount: PropTypes.number,
		emailVerified: PropTypes.bool,
		fallacyCount: PropTypes.number,
		id: PropTypes.number,
		img: PropTypes.string,
		linkedTwitter: PropTypes.bool,
		linkedYoutube: PropTypes.bool,
		patreonUsername: PropTypes.string,
		name: PropTypes.string,
		username: PropTypes.string
	})
}

UserPage.defaultProps = {
	changeProfilePic,
	fetchUserData,
	reset,
	updateAbout,
	user: {}
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.pageUser,
		...state.user,
		...ownProps
	}
}

export default connect(mapStateToProps, {
	changeProfilePic,
	fetchUserData,
	reset,
	updateAbout
})(UserPage)
