import { adjustTimezone } from "utils/dateFunctions"
import { formatNumber, getHighlightedText } from "utils/textFunctions"
import {
	createCommentArchive,
	fetchVideoComments,
	insertComment,
	unsetComment
} from "redux/actions/post"
import { clearContradiction } from "components/fallacyForm/v1/actions"
import { connect } from "react-redux"
import {
	Button,
	Comment,
	Dimmer,
	Divider,
	Header,
	Icon,
	Message,
	Modal,
	Radio,
	Segment,
	Transition,
	Visibility
} from "semantic-ui-react"
import _ from "lodash"
import FallacyForm from "components/fallacyForm/v1/"
import ImagePic from "images/images/image-square.png"
import LazyLoad from "components/lazyLoad/v1/"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Component } from "react"

class YouTubeCommentsSection extends Component {
	constructor(props) {
		super(props)
		this.state = {
			commentId: null,
			duration: 400,
			i: null,
			loadingMore: false,
			open: false,
			page: 0,
			r: null,
			replyId: null,
			visible: true
		}

		this.closeModal = this.closeModal.bind(this)
		this.openModal = this.openModal.bind(this)
		this.viewCommentOnYoutube = this.viewCommentOnYoutube.bind(this)
	}

	closeModal = () => {
		this.setState({ open: false })
		this.props.clearContradiction()
		this.props.unsetComment()
	}

	componentDidMount() {
		if (this.props.auth && this.props.source === "post" && this.props.videoId !== undefined) {
			this.props.fetchVideoComments({
				bearer: this.props.bearer,
				id: this.props.videoId
			})
			this.loadMore = _.debounce(this.loadMore.bind(this), 200)
		}
	}

	componentWillReceiveProps(newProps) {
		if (
			newProps.videoId !== this.props.videoId &&
			newProps.videoId !== undefined &&
			newProps.auth &&
			this.props.source === "post"
		) {
			this.props.fetchVideoComments({
				bearer: newProps.bearer,
				id: newProps.videoId
			})
			this.loadMore = _.debounce(this.loadMore.bind(this), 200)
		}
	}

	loadMore = () => {
		if (this.props.auth && this.props.comments.nextPageToken && this.state.visible) {
			const newPage = parseInt(this.props.comments.page + 1, 10)
			this.setState({
				loadingMore: true,
				page: newPage
			})
			this.props.fetchVideoComments({
				bearer: this.props.bearer,
				id: this.props.videoId,
				page: newPage,
				nextPageToken: this.props.comments.nextPageToken
			})
		}
	}

	onClickArchive = commentId => {
		this.props.createCommentArchive({
			bearer: this.props.bearer,
			commentId,
			id: this.props.videoId
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
			videoId: this.props.videoId
		})
	}

	viewCommentOnYoutube = () => {
		window.open(
			`https://www.youtube.com/watch?v=${this.props.videoId}&lc=${this.props.comment.id}`,
			"_blank"
		)
	}

	render() {
		const { commentId, i, r, open, replyId, visible } = this.state
		const ArchiveInfo = props => {
			if (props.archive) {
				const archiveDate = adjustTimezone(props.archive.date_created)
				return (
					<Message className="archiveMsg">
						<Icon color="green" name="checkmark" /> Archived this{" "}
						<a
							href={`http://archive.is/${props.archive.code}`}
							rel="noopener noreferrer"
							target="_blank"
						>
							comment
						</a>{" "}
						<Moment date={archiveDate} fromNow />
					</Message>
				)
			}
			return null
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
						centered={false}
						className="youtubeCommentModal"
						dimmer="blurring"
						inverted="true"
						onClose={this.closeModal}
						open={open}
						size="small"
					>
						<Modal.Content>
							<Comment.Group>
								{IndividualComment(comment, i, replyId !== null, false)}
							</Comment.Group>
							{ArchiveInfo(props)}
							<Divider />
							<FallacyForm
								authenticated={props.auth}
								bearer={props.bearer}
								commentId={replyId ? replyId : commentId}
								history={props.history}
								network="youtube"
								objectId={props.videoId}
								pageInfo={commentUser}
								sendNotification={props.sendNotification}
								user={commentUser}
							/>
						</Modal.Content>
					</Modal>
				)
			}
			return null
		}

		const CommentsSection = props => (
			<div className="commentsSection">
				<Header dividing size="large">
					Comments
					<Radio
						checked={visible}
						className="toggleComments"
						color="blue"
						onChange={e => this.setState({ visible: !visible })}
						size="tiny"
						slider
					/>
					<div className="clearfix" />
				</Header>
				<Segment basic>
					<Transition animation="scale" duration={400} visible={visible}>
						<Visibility continuous offset={[50, 50]} onBottomVisible={this.loadMore}>
							{props.auth ? (
								<Comment.Group>{DisplayComments(props)}</Comment.Group>
							) : (
								<Dimmer.Dimmable as={Segment} className="commentsDimmer" dimmed>
									<Segment className="lazyLoadSegment">
										<LazyLoad />
									</Segment>
									<Dimmer active>
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
				</Segment>
			</div>
		)

		const DisplayComments = props => {
			if (props.comments.count > 0) {
				return props.comments.items.map((comment, i) => {
					return IndividualComment(comment, i, false, true, false)
				})
			}

			if (props.comments.count === 0 && !props.comments.error) {
				return <Message content="There are no comments..." />
			}

			if (props.comments.code === 403) {
				return <Message content="Comments have been disabled on this video" />
			}

			return [{}, {}, {}, {}, {}, {}, {}].map((comment, i) => (
				<LazyLoad key={`lazyLoadComment_${i}`} />
			))
		}

		const DisplayReplies = (i, replies) => {
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
							<Comment.Text
								onMouseUp={() => {
									if (open) {
										this.props.handleHoverOn()
									}
								}}
							>
								{this.props.highlightedText
									? getHighlightedText(
											snippet.textOriginal,
											this.props.highlightedText
									  )
									: snippet.textOriginal}
							</Comment.Text>
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

		const IndividualComment = (
			comment,
			i,
			reply = false,
			replies = false,
			openModal = true
		) => {
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
							if (!openModal) {
								this.openModal(id, i)
							}
						}}
					>
						<Comment.Author
							as="a"
							onClick={() =>
								this.props.history.push(
									`/pages/youtube/${content.authorChannelId.value}`
								)
							}
						>
							{content.authorDisplayName}
						</Comment.Author>
						<Comment.Metadata>
							<div>
								<Moment date={content.publishedAt} fromNow />
							</div>
						</Comment.Metadata>
						<Comment.Text
							onMouseUp={() => {
								if (open) {
									this.props.handleHoverOn()
								}
							}}
						>
							{this.props.highlightedText
								? getHighlightedText(
										content.textOriginal,
										this.props.highlightedText
								  )
								: content.textOriginal}
						</Comment.Text>
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
							{openModal && (
								<Comment.Action className="archiveComment">
									<Icon
										name="sticky note"
										onClick={() => this.onClickArchive(id)}
									/>
								</Comment.Action>
							)}
						</Comment.Actions>
					</Comment.Content>
					{showReplies > 0 && (
						<Comment.Group>{DisplayReplies(i, comment.replies)}</Comment.Group>
					)}
				</Comment>
			)
		}

		const SelectedComment = props => (
			<Comment.Group>
				<Comment className="selectedComment">
					<Comment.Avatar
						onError={i => (i.target.src = ImagePic)}
						src={props.comment.user.img}
					/>
					<Comment.Content>
						<Comment.Author
							as="a"
							onClick={() =>
								this.props.history.push(`/pages/youtube/${props.comment.user.id}`)
							}
						>
							{props.comment.user.title}
						</Comment.Author>
						<Comment.Metadata>
							<div>
								<Moment date={props.comment.dateCreated} fromNow />
							</div>
						</Comment.Metadata>
						<Comment.Text onMouseUp={() => props.handleHoverOn()}>
							{props.highlightedText
								? getHighlightedText(props.comment.message, props.highlightedText)
								: props.comment.message}
						</Comment.Text>
						<Comment.Actions>
							<Comment.Action className="likeComment">
								<Icon name="thumbs up" />
								{formatNumber(props.comment.likeCount)}
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
		)

		return (
			<div className="youtubeCommentsSection">
				{this.props.showComment && this.props.comment ? (
					<Segment className="selectedCommentWrapper">
						{SelectedComment(this.props)}
					</Segment>
				) : null}
				{this.props.showComments && this.props.comments ? (
					<div>
						{CommentsSection(this.props)}
						{CommentModal(i, this.props, r, replyId)}
					</div>
				) : null}
			</div>
		)
	}
}

YouTubeCommentsSection.propTypes = {
	archive: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.shape({
			code: PropTypes.string,
			date_created: PropTypes.string,
			link: PropTypes.string,
			network: PropTypes.string
		})
	]),
	auth: PropTypes.bool,
	bearer: PropTypes.string,
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
	createArchive: PropTypes.func,
	handleHoverOn: PropTypes.func,
	highlightedText: PropTypes.string,
	insertComment: PropTypes.func,
	sendNotification: PropTypes.func,
	showComment: PropTypes.bool,
	source: PropTypes.string,
	unsetComment: PropTypes.func,
	videoId: PropTypes.string
}

YouTubeCommentsSection.defaultProps = {
	auth: false,
	clearContradiction,
	createCommentArchive,
	comments: {
		code: 0,
		count: 0,
		error: null,
		items: [],
		nextPageToken: null,
		page: 0
	},
	insertComment,
	showComment: false,
	unsetComment
}

const mapStateToProps = (state, ownProps) => ({
	...ownProps
})

export default connect(
	mapStateToProps,
	{
		clearContradiction,
		createCommentArchive,
		fetchVideoComments,
		insertComment,
		unsetComment
	}
)(YouTubeCommentsSection)
