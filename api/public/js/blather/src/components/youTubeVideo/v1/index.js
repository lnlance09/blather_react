import "./style.css"
import {
	fetchVideoArchives,
	updateArchiveDescription,
	updateArchiveEndTime,
	updateArchiveStartTime
} from "./actions"
import { adjustTimezone } from "utils/dateFunctions"
import { formatDuration, formatNumber, formatPlural } from "utils/textFunctions"
import { createVideoArchive, setCurrentVideoTime, setDuration } from "pages/actions/post"
import { clearContradiction, setContradictionVideoTime } from "components/fallacyForm/v1/actions"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import {
	Button,
	Form,
	Grid,
	Header,
	Icon,
	Input,
	Image,
	List,
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
import YouTubeCommentsSection from "./comments"

class YouTubeVideo extends Component {
	constructor(props) {
		super(props)
		const currentState = store.getState()
		const auth = currentState.user.authenticated
		this.state = {
			archiveEndTime: 0,
			archiveVisible: false,
			auth,
			backupMsgOpen: false,
			currentState,
			currentTime: 0
		}

		this.onSubmitArchive = this.onSubmitArchive.bind(this)
		this.seekTo = this.seekTo.bind(this)
		this.setTime = this.setTime.bind(this)
		this.showBackupMsg = this.showBackupMsg.bind(this)
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

		if (this.props.archive) {
			this.props.fetchVideoArchives({
				id: this.props.id
			})
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
	seekTo = a => {
		this.player.seekTo(a.start_time)
		this.setState({
			archiveEndTime: a.end_time
		})
	}
	setTime = e => {
		const time = e.playedSeconds
		if (this.props.contradiction) {
			this.props.setContradictionVideoTime(time)
		}
		this.props.setCurrentVideoTime(time)
		this.setState({ currentTime: time })
	}
	showBackupMsg = e => {
		if (e === 150 && this.props.s3Link) {
			this.setState({
				backupMsgOpen: true
			})
		}
	}
	ref = player => {
		this.player = player
	}

	render() {
		const { archiveEndTime, archiveVisible, auth, backupMsgOpen, currentTime } = this.state
		const dateCreated = this.props.showVideo ? adjustTimezone(this.props.dateCreated) : null
		const ArchiveForm = props => (
			<div className="archiveForm">
				<Form
					className="fluid segment vertical"
					onSubmit={this.onSubmitArchive}
				>
					<Form.Group widths="equal">
						<Form.Input
							fluid
							onChange={this.changeArchiveStartTime}
							placeholder="Start time" 
							type="text" 
							value={props.archiveStartTime} 
						/>
						<Form.Input
							fluid 
							onChange={this.changeArchiveEndTime}
							placeholder="End time" 
							type="text" 
							value={props.archiveEndTime} 
						/>
					</Form.Group>
					<Form.TextArea 
						onChange={this.changeArchiveDescription}
						placeholder="Leave a note" 
						value={props.archiveDescription} 
					/>
					<Button color="blue" compact fluid>Archive</Button>
				</Form>
			</div>
		)
		const ArchivesList = props => {
			if (props.archives) {
				return (
					<div>
						<Header as="h3" dividing>
							My archives
							<Header.Subheader> clips</Header.Subheader>
						</Header>
						<Transition animation="scale" duration={400} visible={archiveVisible}>
							<List className="archivesList" divided relaxed>
								{props.archives.map((a, i) => {
									return (
										<List.Item>
											<List.Content>
												<List.Header>
													<span onClick={() => this.seekTo(a)}>
														{formatDuration(a.start_time)} - {" "}
														{formatDuration(a.end_time)}
													</span>
												</List.Header>
												<List.Description as="p">{a.description}</List.Description>
											</List.Content>
										</List.Item>
									)
								})}
							</List>
						</Transition>
					</div>
				)
			}
		}
		const ChannelCard = props => {
			if (props.channel) {
				return (
					<Segment className={`channelSegment ${props.comment ? "hasComment" : null}`} vertical>
						<Header
							as="h2"
							onClick={() =>
								props.history.push(`/pages/youtube/${props.channel.id}`)
							}
						>
							<Image circular floated="left" size="tiny" src={props.channel.img} />
							<Header.Content>
								{props.channel.title}
								<Header.Subheader><Moment date={dateCreated} fromNow /></Header.Subheader>
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
		const playing = archiveEndTime > 0 ? currentTime <= archiveEndTime : true
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
								url={this.props.existsOnYt ? `https://www.youtube.com/watch?v=${this.props.id}&t=${
									this.props.startTime
								}&end=${this.props.endTime}` : this.props.s3Link}
							/>
							{!this.props.existsOnYt && (
								<Message
									content="You are watching an archived version"
									header="This video has either been deleted or made private"
									info
								/>
							)}

							{this.props.canArchive && this.props.existsOnYt ? (
								<div>
									{ArchiveForm(this.props)}
									{ArchivesList(this.props)}
								</div>
							) : (
								null
							)}

							<Header className="youTubeTitle" size="medium">
								{this.props.redirect ? (
									<Link to={`/video/${this.props.id}`}>{this.props.title}</Link>
								) : (
									this.props.title
								)}
								{this.props.stats && (
									<Header.Subheader>
										{formatNumber(this.props.stats.viewCount)} {" "}
										{formatPlural(this.props.stats.viewCount, "view")}
									</Header.Subheader>
								)}
							</Header>

							{this.props.showChannel && <div>{ChannelCard(this.props)}</div>}

							{this.props.showTimes && (
								<Grid>
									<Grid.Column width={8}>
										<Input
											defaultValue={this.props.startTime}
											placeholder="Start time"
											value={formatDuration(this.props.info.currentTime)}
										/>
									</Grid.Column>
									<Grid.Column width={8}>
										<Input
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

					{(this.props.showComments || this.props.showComment) && this.props.existsOnYt ? (
						<YouTubeCommentsSection
							auth={auth}
							bearer={this.props.bearer}
							comment={this.props.comment}
							comments={this.props.comments}
							history={this.props.history}
							sendNotification={this.props.sendNotification}
							showComment={this.props.showComment}
							showComments={this.props.showComments}
							videoId={this.props.id}
						/>
					) : (
						null
					)}
				</Segment>
			</div>
		)
	}
}

YouTubeVideo.propTypes = {
	archives: PropTypes.array,
	archiveDescription: PropTypes.string,
	archiveEndTime: PropTypes.string,
	archiveStartTime: PropTypes.string,
	canArchive: PropTypes.bool,
	channel: PropTypes.shape({
		id: PropTypes.string,
		img: PropTypes.string,
		title: PropTypes.string
	}),
	changeEndTime: PropTypes.func,
	clearContradiction: PropTypes.func,
	comment: PropTypes.shape({
		dateCreated: PropTypes.string,
		id: PropTypes.string,
		likeCount: PropTypes.number,
		message: PropTypes.string,
		user: PropTypes.shape({
			about: PropTypes.string,
			id: PropTypes.string,
			img: PropTypes.string,
			title: PropTypes.string
		})
	}),
	comments: PropTypes.shape({
		code: PropTypes.number,
		count: PropTypes.number,
		error: PropTypes.bool,
		items: PropTypes.array,
		nextPageToken: PropTypes.string,
		page: PropTypes.number
	}),
	contradiction: PropTypes.bool,
	createVideoArchive: PropTypes.func,
	currentTime: PropTypes.number,
	dateCreated: PropTypes.string,
	description: PropTypes.string,
	endTime: PropTypes.string,
	existsOnYt: PropTypes.bool,
	fetchVideoArchives: PropTypes.func,
	id: PropTypes.string,
	playing: PropTypes.bool,
	redirect: PropTypes.bool,
	s3Link: PropTypes.string,
	sendNotification: PropTypes.func,
	setContradictionVideoTime: PropTypes.func,
	setCurrentVideoTime: PropTypes.func,
	setDuration: PropTypes.func,
	showChannel: PropTypes.bool,
	showComment: PropTypes.bool,
	showComments: PropTypes.bool,
	showStats: PropTypes.bool,
	showTimes: PropTypes.bool,
	showVideo: PropTypes.bool,
	startTime: PropTypes.string,
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
	archiveStartTime: "0:00",
	canArchive: false,
	channel: {},
	clearContradiction,
	comments: {
		code: 0,
		count: 0,
		error: null,
		items: [],
		nextPageToken: null,
		page: 0
	},
	contradiction: false,
	createVideoArchive,
	existsOnYt: true,
	fetchVideoArchives,
	playing: false,
	s3Link: null,
	setContradictionVideoTime,
	setCurrentVideoTime,
	setDuration,
	showChannel: true,
	showComment: false,
	showComments: false,
	showStats: true,
	showTimes: false,
	showVideo: true,
	statists: {},
	updateArchiveDescription,
	updateArchiveEndTime,
	updateArchiveStartTime
}

const mapStateToProps = (state, ownProps) => ({
	...state.post,
	...state.video,
	...ownProps
})

export default connect(
	mapStateToProps,
	{
		clearContradiction,
		createVideoArchive,
		fetchVideoArchives,
		setCurrentVideoTime,
		setDuration,
		setContradictionVideoTime,
		updateArchiveDescription,
		updateArchiveEndTime,
		updateArchiveStartTime
	}
)(YouTubeVideo)
