import "./style.css"
import { formatTime } from "utils/dateFunctions"
import { formatNumber, formatPlural } from "utils/textFunctions"
import {
	createVideoArchive,
	deleteArchive,
	getVideoArchives,
	setCurrentVideoTime,
	setDuration,
	updateArchiveDescription,
	updateArchiveEndTime,
	updateArchiveStartTime
} from "./actions"
import { setContradictionVideoTime } from "components/fallacyForm/v1/actions"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import {
	Button,
	Divider,
	Form,
	Header,
	Image,
	Input,
	Item,
	List,
	Menu,
	Message,
	Progress,
	Segment,
	Statistic,
	Transition
} from "semantic-ui-react"
import LazyLoad from "components/lazyLoad/v1/"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Component } from "react"
import ReactPlayer from "react-player"
import store from "store"
import TextTruncate from "react-text-truncate"
import TimeField from "react-simple-timefield"

class YouTubeVideo extends Component {
	constructor(props) {
		super(props)
		const currentState = store.getState()
		const auth = currentState.user.authenticated
		const user = currentState.user.data
		this.state = {
			activeItem: auth ? "Mine" : "All",
			archiveEndTime: 0,
			archiveVisible: false,
			auth,
			currentState,
			currentTime: this.props.startTime,
			playing: true,
			user
		}

		if (auth && props.source === "post" && this.props.id !== undefined) {
			this.props.getVideoArchives({
				archiveId: this.props.archiveId,
				id: this.props.id,
				userId: user.id
			})
		}

		this.handleItemClick = this.handleItemClick.bind(this)
		this.onSubmitArchive = this.onSubmitArchive.bind(this)
		this.seekTo = this.seekTo.bind(this)
		this.setTime = this.setTime.bind(this)
	}

	componentDidMount() {
		this.setState({ archiveVisible: !this.props.archive })
		// this.player.seekTo(this.props.st)
	}

	componentWillReceiveProps(props) {
		if (
			this.state.auth &&
			props.source === "post" &&
			props.id !== this.props.id &&
			props.id !== undefined
		) {
			this.props.getVideoArchives({
				archiveId: this.props.archiveId,
				id: props.id,
				userId: this.state.user.id
			})
		}
	}

	changeArchiveDescription = (e, { value }) => this.props.updateArchiveDescription(value)

	changeArchiveEndTime = time => this.props.updateArchiveEndTime(time)

	changeArchiveStartTime = time => this.props.updateArchiveStartTime(time)

	deleteArchive = id => this.props.deleteArchive({ bearer: this.props.bearer, id })

	handleItemClick = (e, { name }) => this.setState({ activeItem: name })

	openDownloadLink = link => {
		if (link) {
			const a = document.createElement("a")
			a.target = "_blank"
			a.href = link
			a.download = link.substr(link.lastIndexOf("/") + 1)
			document.body.appendChild(a)
			a.click()
			document.body.removeChild(a)
		}
	}

	onSubmitArchive = () => {
		this.props.createVideoArchive({
			bearer: this.props.bearer,
			endTime: this.props.archiveEndTime,
			description: this.props.archiveDescription,
			id: this.props.id,
			startTime: this.props.archiveStartTime
		})
	}

	ref = player => (this.player = player)

	scrollToTop() {
		const element = document.getElementsByClassName("fallacyForm")
		element[0].scrollIntoView({ behavior: "smooth" })
	}

	seekTo = a => {
		this.player.seekTo(a.start_time)
		this.setState({
			archiveEndTime: a.end_time,
			playing: true
		})
		this.props.history.push(`/video/${this.props.id}?a=${a.id}`)
		window.scroll(0, 0)
	}

	setTime = e => {
		if (this.props.contradiction) {
			return null
		}
		const time = e.playedSeconds
		this.props.setCurrentVideoTime(time)
		this.setState({
			currentTime: time,
			playing: this.state.archiveEndTime > 0 ? time <= this.state.archiveEndTime : true
		})
	}

	render() {
		const { activeItem, archiveVisible, auth, playing, user } = this.state
		const ArchiveForm = props => (
			<div className="archiveForm">
				<Form
					className="fluid segment vertical"
					error={props.archiveError}
					onSubmit={this.onSubmitArchive}
				>
					<Form.Group widths="equal">
						<TimeField
							input={
								<Form.Input
									fluid
									icon="hourglass end"
									placeholder="Start time"
									type="text"
								/>
							}
							onChange={this.changeArchiveStartTime}
							showSeconds
							style={{ width: "100%", fontSize: 14 }}
							value={props.archiveStartTime}
						/>
						<TimeField
							input={
								<Form.Input
									fluid
									icon="hourglass end"
									placeholder="End time"
									type="text"
								/>
							}
							onChange={this.changeArchiveEndTime}
							showSeconds
							style={{ width: "100%", fontSize: 14 }}
							value={props.archiveEndTime}
						/>
					</Form.Group>
					<Form.TextArea
						maxLength={250}
						onChange={this.changeArchiveDescription}
						placeholder="Leave a note"
						value={props.archiveDescription}
					/>
					{props.archiveError && <Message error content={props.archiveErrorMsg} />}
					<Button color="blue" compact fluid>
						Archive
					</Button>
				</Form>
			</div>
		)
		const ArchivesList = props => {
			const archives = activeItem === "All" ? props.archives : props.myArchives
			if (!archives || archives === undefined || props === undefined) {
				return null
			}
			return (
				<div>
					<Menu pointing secondary>
						{auth && (
							<Menu.Item
								active={activeItem === "Mine"}
								name="Mine"
								onClick={this.handleItemClick}
							/>
						)}
						<Menu.Item
							active={activeItem === "All"}
							name="All"
							onClick={this.handleItemClick}
						/>
					</Menu>
					{archives.length === 0 ? (
						<Message
							content={`${
								activeItem === "Mine" ? "You haven't " : "There aren't any "
							} archived any clips yet`}
						/>
					) : (
						<Transition animation="scale" duration={400} visible={archiveVisible}>
							<Item.Group className="archivesList" divided>
								{archives.map((a, i) => {
									if (a !== undefined) {
										return (
											<Item
												className={`archiveItem ${
													props.archiveId === a.id ? "selected" : ""
												}`}
												key={`${a.start_time}_${a.end_time}`}
												onClick={() => this.seekTo(a)}
											>
												<Item.Content>
													<Item.Header>
														{formatTime(a.start_time)} -{" "}
														{formatTime(a.end_time)}
													</Item.Header>
													<Item.Description>
														{a.description}
													</Item.Description>
													<Item.Extra>
														<List bulleted horizontal link>
															{a.user_id === user.id && (
																<List.Item
																	as="a"
																	className="deleteArchive"
																	onClick={e => {
																		e.stopPropagation()
																		this.deleteArchive(a.id)
																	}}
																>
																	Delete
																</List.Item>
															)}
															<List.Item
																as="a"
																onClick={e => {
																	e.stopPropagation()
																	props.setClip(
																		a.start_time,
																		a.end_time
																	)
																	this.scrollToTop()
																}}
															>
																Use
															</List.Item>
														</List>
													</Item.Extra>
												</Item.Content>
											</Item>
										)
									}
									return null
								})}
							</Item.Group>
						</Transition>
					)}
				</div>
			)
		}
		const ChannelCard = props => {
			if (props.channel) {
				return (
					<Segment className="channelSegment" vertical>
						<Header
							as="h2"
							onClick={() => props.history.push(`/pages/youtube/${props.channel.id}`)}
						>
							<Image
								bordered
								circular
								floated="left"
								size="tiny"
								src={props.channel.img}
							/>
							<Header.Content>
								{props.channel.title}
								<Header.Subheader>
									<Moment date={props.dateCreated} format="MMM DD, YYYY" />
								</Header.Subheader>
							</Header.Content>
						</Header>
						{props.showDescription && (
							<TextTruncate
								className="videoDescription"
								line={3}
								text={props.description}
								truncateText="..."
							/>
						)}
					</Segment>
				)
			}
			return <LazyLoad />
		}
		const DisplayStats = props => {
			if (props.stats) {
				return (
					<div className="stats">
						<div className="likeCount">
							<Statistic size="tiny">
								<Statistic.Value>
									{formatNumber(props.stats.likeCount)}
								</Statistic.Value>
								<Statistic.Label>
									{formatPlural(props.stats.likeCount, "like")}
								</Statistic.Label>
							</Statistic>
							<Statistic size="tiny">
								<Statistic.Value>
									{formatNumber(props.stats.dislikeCount)}
								</Statistic.Value>
								<Statistic.Label>
									{formatPlural(props.stats.dislikeCount, "dislike")}
								</Statistic.Label>
							</Statistic>
						</div>
						<div className="clearfix" />
					</div>
				)
			}
			return null
		}
		const PopularityBar = props => (
			<Progress color="green" percent={props.stats ? props.stats.likePct : null} progress />
		)
		return (
			<div className="youTubeVideo">
				<Segment>
					{this.props.showVideo && (
						<div>
							<ReactPlayer
								className="videoPlayer"
								controls
								onDuration={e => this.props.setDuration({ duration: e })}
								onError={this.showBackupMsg}
								onProgress={this.setTime}
								playing={this.props.playing && playing}
								ref={this.ref}
								url={
									this.props.existsOnYt
										? `https://www.youtube.com/watch?v=${this.props.id}&t=${
												this.props.startTime
										  }&end=${this.props.endTime}`
										: this.props.s3Link
								}
							/>
							{!this.props.existsOnYt && auth && this.props.id ? (
								<Message
									content="You are watching an archived version"
									header="This video has either been deleted or made private"
									info
								/>
							) : null}

							<Header className="youTubeTitle" size="medium">
								{this.props.redirect ? (
									<Link to={`/video/${this.props.id}`}>{this.props.title}</Link>
								) : (
									this.props.title
								)}
								{this.props.stats && (
									<Header.Subheader>
										{formatNumber(this.props.stats.viewCount)}{" "}
										{formatPlural(this.props.stats.viewCount, "view")}
									</Header.Subheader>
								)}
							</Header>

							{this.props.showChannel && <div>{ChannelCard(this.props)}</div>}

							{this.props.canArchive && (
								<div>
									<Divider />
									{ArchiveForm(this.props)}
									<Divider />
									{ArchivesList(this.props)}
								</div>
							)}

							{this.props.showTimes && (
								<Form.Group className="editVideoTimes" widths="equal">
									<Form.Field>
										<TimeField
											input={
												<Input
													icon="hourglass start"
													placeholder="Start time"
												/>
											}
											onChange={this.props.changeStartTime}
											showSeconds
											style={{ width: "100%", fontSize: 14 }}
											value={this.props.startTime}
										/>
									</Form.Field>
									<Form.Field>
										<TimeField
											input={
												<Input
													icon="hourglass end"
													placeholder="End time"
												/>
											}
											onChange={this.props.changeEndTime}
											showSeconds
											style={{ width: "100%", fontSize: 14 }}
											value={this.props.endTime}
										/>
									</Form.Field>
								</Form.Group>
							)}

							{this.props.showStats && (
								<div>
									{PopularityBar(this.props)}
									{DisplayStats(this.props)}
								</div>
							)}
						</div>
					)}
				</Segment>
			</div>
		)
	}
}

YouTubeVideo.propTypes = {
	archiveDescription: PropTypes.string,
	archiveEndTime: PropTypes.string,
	archiveError: PropTypes.bool,
	archiveErrorMsg: PropTypes.string,
	archiveId: PropTypes.string,
	archives: PropTypes.array,
	archiveStartTime: PropTypes.string,
	canArchive: PropTypes.bool,
	channel: PropTypes.shape({
		id: PropTypes.string,
		img: PropTypes.string,
		title: PropTypes.string
	}),
	changeEndTime: PropTypes.func,
	changeStartTime: PropTypes.func,
	contradiction: PropTypes.bool,
	createVideoArchive: PropTypes.func,
	currentTime: PropTypes.number,
	dateCreated: PropTypes.string,
	deleteArchive: PropTypes.func,
	description: PropTypes.string,
	endTime: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	existsOnYt: PropTypes.bool,
	id: PropTypes.string,
	myArchives: PropTypes.array,
	playing: PropTypes.bool,
	redirect: PropTypes.bool,
	s3Link: PropTypes.string,
	sendNotification: PropTypes.func,
	setClip: PropTypes.func,
	setContradictionVideoTime: PropTypes.func,
	setCurrentVideoTime: PropTypes.func,
	showDescription: PropTypes.bool,
	setDuration: PropTypes.func,
	showChannel: PropTypes.bool,
	showStats: PropTypes.bool,
	showTimes: PropTypes.bool,
	showVideo: PropTypes.bool,
	source: PropTypes.string,
	startTime: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	stats: PropTypes.shape({
		commentCount: PropTypes.number,
		dislikeCount: PropTypes.number,
		likeCount: PropTypes.number,
		likePct: PropTypes.number,
		viewCount: PropTypes.number
	}),
	title: PropTypes.string,
	updateArchiveDescription: PropTypes.func,
	updateArchiveEndTime: PropTypes.func,
	updateArchiveStartTime: PropTypes.func
}

YouTubeVideo.defaultProps = {
	archiveDescription: "",
	archiveEndTime: "00:00:01",
	archiveError: false,
	archives: [],
	archiveStartTime: "00:00:00",
	canArchive: false,
	channel: {},
	contradiction: false,
	createVideoArchive,
	deleteArchive,
	existsOnYt: true,
	getVideoArchives,
	myArchives: [],
	playing: false,
	s3Link: null,
	setContradictionVideoTime,
	setCurrentVideoTime,
	setDuration,
	showDescription: false,
	showChannel: true,
	showStats: true,
	showTimes: false,
	showVideo: true,
	source: "post",
	statists: {},
	updateArchiveDescription,
	updateArchiveEndTime,
	updateArchiveStartTime
}

const mapStateToProps = (state, ownProps) => ({
	...state.video,
	...ownProps
})

export default connect(
	mapStateToProps,
	{
		createVideoArchive,
		deleteArchive,
		getVideoArchives,
		setCurrentVideoTime,
		setDuration,
		setContradictionVideoTime,
		updateArchiveDescription,
		updateArchiveEndTime,
		updateArchiveStartTime
	}
)(YouTubeVideo)
