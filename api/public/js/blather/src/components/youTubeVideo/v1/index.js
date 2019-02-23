import "./style.css"
import { createArchive } from "pages/actions/post"
import { formatDuration, formatNumber, formatPlural } from "utils/textFunctions"
import {
	fetchVideoComments,
	insertComment,
	setCurrentVideoTime,
	setDuration,
	unsetComment
} from "pages/actions/post"
import { clearContradiction, setContradictionVideoTime } from "components/fallacyForm/v1/actions"
import { adjustTimezone } from "utils/dateFunctions"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import {
	Button,
	Card,
	Comment,
	Dimmer,
	Grid,
	Header,
	Icon,
	Input,
	Image,
	Message,
	Modal,
	Progress,
	Radio,
	Segment,
	Statistic,
	Transition,
	Visibility
} from "semantic-ui-react"
import _ from "lodash"
import FallacyForm from "components/fallacyForm/v1/"
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
		const authenticated = currentState.user.authenticated
		this.state = {
			animation: "scale",
			archiveVisible: false,
			authenticated,
			commentId: null,
			currentState,
			duration: 400,
			i: null,
			loadingMore: false,
			open: false,
			page: 0,
			r: null,
			replyId: null,
			visible: props.showComments ? true : false
		}

		this.closeModal = this.closeModal.bind(this)
		this.onClickArchive = this.onClickArchive.bind(this)
		this.openModal = this.openModal.bind(this)
		this.setTime = this.setTime.bind(this)
		this.viewCommentOnYoutube = this.viewCommentOnYoutube.bind(this)
	}

	componentDidMount() {
		if (this.props.showComments) {
			this.props.fetchVideoComments({
				bearer: this.props.bearer,
				id: this.props.id
			})
			this.loadMore = _.debounce(this.loadMore.bind(this), 200)
		}
		this.setState({ archiveVisible: this.props.archive ? true : false })
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ archiveVisible: nextProps.archive ? true : false })
	}

	closeModal = () => {
		this.setState({ open: false })
		this.props.clearContradiction()
		this.props.unsetComment()
	}

	loadMore = () => {
		if (this.state.authenticated && this.props.comments.nextPageToken && this.state.visible) {
			const newPage = parseInt(this.props.comments.page + 1, 10)
			this.setState({
				loadingMore: true,
				page: newPage
			})
			this.props.fetchVideoComments({
				bearer: this.props.bearer,
				id: this.props.id,
				page: newPage,
				nextPageToken: this.props.comments.nextPageToken
			})
		}
	}

	onClickArchive = () => {
		this.props.createArchive({
			bearer: this.props.bearer,
			url: `https://www.youtube.com/watch?v=${this.props.id}`
		})
	}

	openModal = (commentId, i, r = null, replyId = null) => {
		this.setState({
			open: true,
			commentId,
			i,
			r,
			replyId
		})
		this.props.insertComment({
			bearer: this.props.bearer,
			id: replyId ? replyId : commentId,
			videoId: this.props.id
		})
	}

	setTime = e => {
		if (this.props.contradiction) {
			this.props.setContradictionVideoTime(e.playedSeconds)
		}
		this.props.setCurrentVideoTime(e.playedSeconds)
	}

	viewCommentOnYoutube = () => {
		window.open(
			`https://www.youtube.com/watch?v=${this.props.id}&lc=${this.props.comment.id}`,
			"_blank"
		)
	}

	render() {
		const {
			animation,
			archiveVisible,
			authenticated,
			commentId,
			duration,
			i,
			r,
			replyId,
			visible,
			open
		} = this.state
		const dateCreated = adjustTimezone(this.props.dateCreated)
		const ArchiveIcon = props => {
			if (!props.archive) {
				return (
					<div>
						Archive this video
						<Icon
							color="yellow"
							name="sticky note"
							onClick={this.onClickArchive}
							size="large"
						/>
					</div>
				)
			}
		}
		const ArchiveInfo = props => {
			if (props.archive) {
				const archiveDate = adjustTimezone(props.archive.date_created)
				return (
					<Transition animation={animation} duration={duration} visible={archiveVisible}>
						<Message className="archiveMsg" positive>
							<Icon name="checkmark" /> Archived{" "}
							<a href={`http://archive.is/${props.archive.code}`}>video</a>{" "}
							<Moment date={archiveDate} fromNow />
						</Message>
					</Transition>
				)
			}
		}
		const ChannelCard = props => {
			if (props.channel) {
				return (
					<Card className={`channelCard ${props.comment ? "hasComment" : null}`} fluid>
						<Card.Content>
							<Image circular floated="left" size="mini" src={props.channel.img} />
							<Card.Header
								onClick={() =>
									props.history.push(`/pages/youtube/${props.channel.id}`)
								}
							>
								{props.channel.title}
							</Card.Header>
							<Card.Meta>
								<Moment date={dateCreated} fromNow />
							</Card.Meta>
							<Card.Description>
								<TextTruncate
									line={3}
									text={props.description}
									truncateText="..."
								/>
							</Card.Description>
						</Card.Content>
						{props.canArchive && (
							<Card.Content extra>
								{ArchiveIcon(props)}
								{ArchiveInfo(props)}
							</Card.Content>
						)}
					</Card>
				)
			}
			return <LazyLoad />
		}
		const CommentModal = (i, props, r = null, replyId = null) => {
			if (props.comments.count > 0 && i !== null) {
				let comment = props.comments.items[i]
				let commentUser = {
					id: comment.snippet.topLevelComment.snippet.authorChannelId.value,
					name: comment.snippet.topLevelComment.snippet.authorDisplayName,
					type: "youtube",
					username: null
				}

				if (replyId) {
					comment = comment.replies.comments[r]
				}

				return (
					<Modal
						className="youtubeCommentModal"
						inverted="true"
						onClose={this.closeModal}
						open={open}
						size="small"
					>
						<Modal.Header>Assign a fallacy</Modal.Header>
						<Modal.Content>
							<Comment.Group>
								<IndividualComment
									comment={comment}
									i={i}
									reply={replyId !== null}
								/>
							</Comment.Group>
							<FallacyForm
								authenticated={authenticated}
								bearer={props.bearer}
								commentId={replyId ? replyId : commentId}
								history={this.props.history}
								network="youtube"
								objectId={props.id}
								pageInfo={commentUser}
								user={commentUser}
							/>
						</Modal.Content>
					</Modal>
				)
			}
			return null
		}
		const CommentsSection = props => {
			if (props.showComments) {
				return (
					<div className="commentsSection">
						<Header dividing size="medium">
							Comments
							<Radio
								className="toggleComments"
								color="blue"
								checked={visible}
								onChange={e =>
									this.setState({
										visible: visible ? false : true
									})
								}
								size="tiny"
								slider
							/>
						</Header>
						<Transition animation={animation} duration={duration} visible={visible}>
							<Visibility
								continuous
								offset={[50, 50]}
								onBottomVisible={this.loadMore}
							>
								{authenticated ? (
									<Comment.Group>{DisplayComments(this.props)}</Comment.Group>
								) : (
									<Dimmer.Dimmable
										as={Segment}
										className="commentsDimmer"
										blurring
										dimmed
									>
										<Segment className="lazyLoadSegment">
											<LazyLoad />
										</Segment>
										<Dimmer active inverted>
											<Header as="h2">Sign in to see comments</Header>
											<Button
												color="green"
												onClick={e => props.history.push("/signin")}
											>
												Sign in
											</Button>
										</Dimmer>
									</Dimmer.Dimmable>
								)}
							</Visibility>
						</Transition>
					</div>
				)
			}
			return null
		}
		const DisplayComments = props => {
			if (!props.comments.error && props.comments.count > 0 && props.showComments) {
				return props.comments.items.map((comment, i) => {
					return (
						<IndividualComment
							comment={comment}
							i={i}
							key={`individualComment${i}`}
							replies
						/>
					)
				})
			}

			if (
				props.comments.error === false &&
				props.comments.count === 0 &&
				props.showComments
			) {
				return <p className="emptyCommentMsg">There are no comments...</p>
			}

			if (props.comments.code === 403) {
				return <p className="emptyCommentMsg">Comments have been disabled on this video</p>
			}

			return [{}, {}, {}, {}, {}, {}, {}].map((comment, i) => (
				<LazyLoad key={`lazyLoadComment_${i}`} />
			))
		}
		const DisplayReplies = ({ i, replies }) => {
			return replies.comments.map((reply, r) => {
				let id = reply.id
				let snippet = reply.snippet
				let videoId = snippet.videoId
				let link = `https://www.youtube.com/watch?v=${videoId}&lc=${id}`
				return (
					<Comment
						key={id}
						onClick={() => {
							this.openModal(snippet.parentId, i, r, id)
						}}
					>
						<Comment.Avatar
							onError={i => (i.target.src = ImagePic)}
							src={snippet.authorProfileImageUrl}
						/>
						<Comment.Content>
							<Comment.Author as="a">{snippet.authorDisplayName}</Comment.Author>
							<Comment.Metadata>
								<div>
									<Moment date={snippet.publishedAt} fromNow />
								</div>
							</Comment.Metadata>
							<Comment.Text>{snippet.textOriginal}</Comment.Text>
							<Comment.Actions>
								<Comment.Action className="likeComment">
									<Icon name="thumbs up" />
									{formatNumber(snippet.likeCount)}
								</Comment.Action>
								<Comment.Action
									className="youtubeLink"
									onClick={() => (window.location.href = link)}
								>
									<Icon color="red" name="youtube" />
									View on YouTube
								</Comment.Action>
							</Comment.Actions>
						</Comment.Content>
					</Comment>
				)
			})
		}
		const DisplayStats = props => {
			if (props.stats) {
				return (
					<div className="stats">
						<div className="viewCount">
							<Statistic size="tiny">
								<Statistic.Value>
									{formatNumber(props.stats.viewCount)}
								</Statistic.Value>
								<Statistic.Label>
									{formatPlural(props.stats.viewCount, "view")}
								</Statistic.Label>
							</Statistic>
						</div>
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
		const IndividualComment = ({ comment, i, reply = false, replies = false }) => {
			let snippet = comment.snippet
			let id = reply ? comment.id : snippet.topLevelComment.id
			let content = reply ? comment.snippet : snippet.topLevelComment.snippet
			let videoId = snippet.videoId
			let link = `https://www.youtube.com/watch?v=${videoId}&lc=${id}`
			const showReplies = replies && !reply && snippet.totalReplyCount > 0
			return (
				<Comment key={id}>
					<Comment.Avatar
						onError={i => (i.target.src = ImagePic)}
						src={content.authorProfileImageUrl}
					/>
					<Comment.Content
						onClick={() => {
							this.openModal(id, i)
						}}
					>
						<Comment.Author as="a">{content.authorDisplayName}</Comment.Author>
						<Comment.Metadata>
							<div>
								<Moment date={content.publishedAt} fromNow />
							</div>
						</Comment.Metadata>
						<Comment.Text>{content.textOriginal}</Comment.Text>
						<Comment.Actions>
							<Comment.Action className="likeComment">
								<Icon name="thumbs up" />
								{formatNumber(content.likeCount)}
							</Comment.Action>
							<Comment.Action
								className="youtubeLink"
								onClick={() => window.open(link, "_blank")}
							>
								<Icon color="red" name="youtube" />
								View on YouTube
							</Comment.Action>
						</Comment.Actions>
					</Comment.Content>
					{showReplies > 0 && (
						<Comment.Group>
							<DisplayReplies i={i} replies={comment.replies} />
						</Comment.Group>
					)}
				</Comment>
			)
		}
		const PopularityBar = props => (
			<Progress color="red" percent={props.stats ? props.stats.likePct : null} progress />
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
								onProgress={this.setTime}
								url={`https://www.youtube.com/watch?v=${this.props.id}&t=${
									this.props.startTime
								}&end=${this.props.endTime}`}
							/>
							<Header className="youTubeTitle" size="medium">
								{this.props.redirect ? (
									<Link to={`/video/${this.props.id}`}>{this.props.title}</Link>
								) : (
									this.props.title
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

					{this.props.showComment && (
						<Comment.Group>
							<Comment>
								<Comment.Avatar
									onError={i => (i.target.src = ImagePic)}
									src={this.props.comment.user.img}
								/>
								<Comment.Content>
									<Comment.Author
										as="a"
										onClick={() =>
											this.props.history.push(
												`/pages/youtube/${this.props.comment.user.id}`
											)
										}
									>
										{this.props.comment.user.title}
									</Comment.Author>
									<Comment.Metadata>
										<div>
											<Moment date={this.props.comment.dateCreated} fromNow />
										</div>
									</Comment.Metadata>
									<Comment.Text>{this.props.comment.message}</Comment.Text>
									<Comment.Actions>
										<Comment.Action className="likeComment">
											<Icon name="thumbs up" />
											{formatNumber(this.props.comment.likeCount)}
										</Comment.Action>
										<Comment.Action
											className="youtubeLink"
											onClick={this.viewCommentOnYoutube}
										>
											<Icon color="red" name="youtube" />
											View on YouTube
										</Comment.Action>
									</Comment.Actions>
								</Comment.Content>
							</Comment>
						</Comment.Group>
					)}

					{this.props.showComments && (
						<div>
							{CommentsSection(this.props)}
							{CommentModal(i, this.props, r, replyId)}
						</div>
					)}
				</Segment>
			</div>
		)
	}
}

YouTubeVideo.propTypes = {
	archive: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.shape({
			code: PropTypes.string,
			date_created: PropTypes.string,
			link: PropTypes.string,
			network: PropTypes.string
		})
	]),
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
	createArchive: PropTypes.func,
	currentTime: PropTypes.number,
	dateCreated: PropTypes.string,
	description: PropTypes.string,
	endTime: PropTypes.string,
	id: PropTypes.string,
	insertComment: PropTypes.func,
	redirect: PropTypes.bool,
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
	unsetComment: PropTypes.func
}

YouTubeVideo.defaultProps = {
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
	createArchive,
	insertComment,
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
	unsetComment
}

const mapStateToProps = (state, ownProps) => ({
	...state.post,
	...ownProps
})

export default connect(
	mapStateToProps,
	{
		clearContradiction,
		createArchive,
		fetchVideoComments,
		insertComment,
		setCurrentVideoTime,
		setDuration,
		setContradictionVideoTime,
		unsetComment
	}
)(YouTubeVideo)
