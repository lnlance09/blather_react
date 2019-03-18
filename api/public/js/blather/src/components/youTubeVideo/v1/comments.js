import { formatNumber } from "utils/textFunctions"
import { fetchVideoComments, insertComment, unsetComment } from "pages/actions/post"
import { clearContradiction } from "components/fallacyForm/v1/actions"
import { connect } from "react-redux"
import {
	Button,
	Comment,
	Dimmer,
	Divider,
	Header,
	Icon,
	Modal,
	Radio,
	Segment,
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
		this.props.fetchVideoComments({
			bearer: this.props.bearer,
			id: this.props.videoId
		})
		this.loadMore = _.debounce(this.loadMore.bind(this), 200)
	}

	componentWillReceiveProps(newProps) {
		if (newProps.videoId !== this.props.videoId) {
			this.props.fetchVideoComments({
				bearer: this.props.bearer,
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
								{IndividualComment(comment, i, replyId !== null)}
							</Comment.Group>
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
				<div>
					<Radio
						checked={visible}
						className="toggleComments"
						color="blue"
						onChange={e => this.setState({ visible: !visible })}
						size="tiny"
						slider
					/>
					<div className="clearfix" />
				</div>
				<Divider />
				<Transition animation="scale" duration={400} visible={visible}>
					<Visibility continuous offset={[50, 50]} onBottomVisible={this.loadMore}>
						{props.auth ? (
							<Comment.Group>{DisplayComments(props)}</Comment.Group>
						) : (
							<Dimmer.Dimmable
								as={Segment}
								blurring
								className="commentsDimmer"
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

		const DisplayComments = props => {
			if (props.comments.count > 0) {
				return props.comments.items.map((comment, i) => {
					return IndividualComment(comment, i, false, true)
				})
			}

			if (props.comments.count === 0 && !props.comments.error) {
				return <p className="emptyCommentMsg">There are no comments...</p>
			}

			if (props.comments.code === 403) {
				return <p className="emptyCommentMsg">Comments have been disabled on this video</p>
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

		const IndividualComment = (comment, i, reply = false, replies = false) => {
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
						<Comment.Group>{DisplayReplies(i, comment.replies)}</Comment.Group>
					)}
				</Comment>
			)
		}

		const SelectedComment = props => (
			<Comment.Group>
				<Comment>
					<Comment.Avatar
						onError={i => (i.target.src = ImagePic)}
						src={props.comment.user.img}
					/>
					<Comment.Content>
						<Comment.Author
							as="a"
							onClick={() =>
								props.history.push(`/pages/youtube/${props.comment.user.id}`)
							}
						>
							{props.comment.user.title}
						</Comment.Author>
						<Comment.Metadata>
							<div>
								<Moment date={props.comment.dateCreated} fromNow />
							</div>
						</Comment.Metadata>
						<Comment.Text>{props.comment.message}</Comment.Text>
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
			<div>
				{this.props.showComment && <div>{SelectedComment(this.props)}</div>}
				{this.props.showComments && (
					<div>
						{CommentsSection(this.props)}
						{CommentModal(i, this.props, r, replyId)}
					</div>
				)}
			</div>
		)
	}
}

YouTubeCommentsSection.propTypes = {
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
	insertComment: PropTypes.func,
	sendNotification: PropTypes.func,
	showComment: PropTypes.bool,
	unsetComment: PropTypes.func,
	videoId: PropTypes.string
}

YouTubeCommentsSection.defaultProps = {
	auth: false,
	clearContradiction,
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
		fetchVideoComments,
		insertComment,
		unsetComment
	}
)(YouTubeCommentsSection)
