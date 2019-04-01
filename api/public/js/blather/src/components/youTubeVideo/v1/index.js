import "./style.css"
import { formatDuration, formatNumber, formatPlural } from "utils/textFunctions"
import {
	createVideoArchive,
	deleteArchive,
	getVideoArchives,
	setCurrentVideoTime,
	setDuration,
	updateArchiveDescription,
	updateArchiveEndTime,
	updateArchiveStartTime
} from "pages/actions/post"
import { clearContradiction, setContradictionVideoTime } from "components/fallacyForm/v1/actions"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import {
	Button,
	Divider,
	Form,
	Grid,
	Header,
	Icon,
	Image,
	Input,
	List,
	Menu,
	Message,
	Progress,
	Segment,
	Statistic,
	Transition
} from "semantic-ui-react"
import ImagePic from "images/image-square.png"
import LazyLoad from "components/lazyLoad/v1/"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Component } from "react"
import ReactPlayer from "react-player"
import store from "store"
import TextTruncate from "react-text-truncate"

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
			currentTime: 0,
			playing: true,
			user
		}

		if (auth && props.source === "post" && this.props.id !== undefined) {
			this.props.getVideoArchives({
				id: this.props.id,
				userId: user.id
			})
		}

		this.handleItemClick = this.handleItemClick.bind(this)
		this.onSubmitArchive = this.onSubmitArchive.bind(this)
		this.seekTo = this.seekTo.bind(this)
		this.setTime = this.setTime.bind(this)
	}

	changeArchiveDescription = (e, { value }) => {
		this.props.updateArchiveDescription(value)
	}
	changeArchiveEndTime = (e, { value }) => {
		this.props.updateArchiveEndTime(value)
	}
	changeArchiveStartTime = (e, { value }) => {
		this.props.updateArchiveStartTime(value)
	}
	componentDidMount() {
		this.setState({ archiveVisible: !this.props.archive })
	}
	componentWillReceiveProps(props) {
		if (
			this.state.auth &&
			props.source === "post" &&
			props.id !== this.props.id &&
			props.id !== undefined
		) {
			this.props.getVideoArchives({
				id: props.id,
				userId: this.state.user.id
			})
		}
	}
	deleteArchive = id => {
		this.props.deleteArchive({ bearer: this.props.bearer, id })
	}
	handleItemClick = (e, { name }) => {
		this.setState({ activeItem: name })
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
	ref = player => {
		this.player = player
	}
	seekTo = a => {
		this.player.seekTo(a.start_time)
		this.setState({
			archiveEndTime: a.end_time,
			playing: true
		})
	}
	setTime = e => {
		const time = e.playedSeconds
		if (this.props.contradiction) {
			this.props.setContradictionVideoTime(time)
		}
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
						<Form.Input
							fluid
							icon="hourglass start"
							onChange={this.changeArchiveStartTime}
							placeholder="Start time"
							type="text"
							value={props.archiveStartTime}
						/>
						<Form.Input
							fluid
							icon="hourglass end"
							onChange={this.changeArchiveEndTime}
							placeholder="End time"
							type="text"
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
			if (!archives) {
				return null
			}
			return (
				<div>
					<Menu secondary>
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
					{props.archives.length === 0 ? (
						<Message
							content={`${
								activeItem === "Mine" ? "You haven't " : "There aren't any "
							} archived any clips yet`}
						/>
					) : (
						<Transition animation="scale" duration={400} visible={archiveVisible}>
							<List className="archivesList" divided relaxed selection>
								{archives.map((a, i) => {
									return (
										<List.Item key={`${a.start_time}_${a.end_time}`}>
											{a.user_id === user.id && (
												<List.Content floated="right">
													<Icon
														color="red"
														name="delete"
														onClick={() => this.deleteArchive(a.id)}
														size="small"
													/>
												</List.Content>
											)}
											<Image
												avatar
												circular
												onError={i => (i.target.src = ImagePic)}
												src={a.img === null ? ImagePic : a.img}
											/>
											<List.Content>
												<List.Header onClick={() => this.seekTo(a)}>
													<span>
														{formatDuration(a.start_time)} -{" "}
														{formatDuration(a.end_time)}
													</span>
												</List.Header>
												<List.Description as="p">
													{a.description}
												</List.Description>
											</List.Content>
										</List.Item>
									)
								})}
							</List>
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
						<TextTruncate
							className="videoDescription"
							line={3}
							text={props.description}
							truncateText="..."
						/>
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
								<Grid className="editVideoTimes">
									<Grid.Column width={8}>
										<Input
											icon="hourglass start"
											placeholder="Start time"
											value={formatDuration(this.props.info.currentTime)}
										/>
									</Grid.Column>
									<Grid.Column width={8}>
										<Input
											icon="hourglass end"
											onChange={this.props.changeEndTime}
											placeholder="End time"
											value={this.props.endTime}
										/>
									</Grid.Column>
								</Grid>
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
	archives: PropTypes.array,
	archiveStartTime: PropTypes.string,
	canArchive: PropTypes.bool,
	channel: PropTypes.shape({
		id: PropTypes.string,
		img: PropTypes.string,
		title: PropTypes.string
	}),
	changeEndTime: PropTypes.func,
	clearContradiction: PropTypes.func,
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
	setContradictionVideoTime: PropTypes.func,
	setCurrentVideoTime: PropTypes.func,
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
	archiveEndTime: "0:01",
	archiveError: false,
	archiveStartTime: "0:00",
	canArchive: false,
	channel: {},
	clearContradiction,
	contradiction: false,
	createVideoArchive,
	deleteArchive,
	existsOnYt: true,
	getVideoArchives,
	playing: false,
	s3Link: null,
	setContradictionVideoTime,
	setCurrentVideoTime,
	setDuration,
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
	...state.post,
	...ownProps
})

export default connect(
	mapStateToProps,
	{
		clearContradiction,
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
