import "./style.css"
import { fetchComments, postComment, voteOnComment } from "./actions"
import { adjustTimezone } from "utils/dateFunctions"
import { connect } from "react-redux"
import { Button, Comment, Form, Header, Icon, Segment } from "semantic-ui-react"
import ImagePic from "images/images/image-square.png"
import Moment from "react-moment"
import defaultImg from "images/avatar/small/steve.jpg"
import PropTypes from "prop-types"
import React, { Component } from "react"
import Linkify from "react-linkify"

class CommentsSection extends Component {
	constructor(props) {
		super(props)

		this.state = {
			message: ""
		}
	}

	componentDidMount() {
		this.props.fetchComments({
			id: this.props.id,
			page: 0
		})
	}

	onChangeMessage = (e, { value }) => this.setState({ message: value })

	onSubmitForm = e => {
		if (this.state.message !== "") {
			this.props.postComment({
				bearer: this.props.bearer,
				callback: this.resetMessage,
				id: this.props.id,
				message: this.state.message
			})
		}
	}

	resetMessage = () => this.setState({ message: "" })

	render() {
		const { message } = this.state
		const { authenticated, comments } = this.props
		const placeholder = comments.count === 0 ? "Be the first to comment..." : "Add a comment..."

		const RenderComments = props => {
			return props.comments.results.map((comment, i) => {
				return (
					<Comment key={`fallacy_comment_${i}`}>
						<Comment.Avatar
							onError={i => (i.target.src = ImagePic)}
							size="tiny"
							src={comment.img ? comment.img : defaultImg}
						/>
						<Comment.Content>
							<Comment.Author
								as="a"
								onClick={() => props.history.push(`/users/${comment.username}`)}
							>
								{comment.name}
							</Comment.Author>
							<Comment.Metadata>
								<div>
									<Moment date={adjustTimezone(comment.created_at)} fromNow />
								</div>
							</Comment.Metadata>
							<Comment.Text>
								<Linkify properties={{ target: "_blank" }}>
									{comment.message}
								</Linkify>
							</Comment.Text>
						</Comment.Content>
					</Comment>
				)
			})
		}

		const ReplyForm = props => (
			<Form inverted onSubmit={this.onSubmitForm} size="big">
				<Form.TextArea
					autoHeight
					// disabled={!props.authenticated}
					inverted
					onChange={this.onChangeMessage}
					placeholder={placeholder}
					value={message}
				/>
				{authenticated ? (
					<Button
						className="replyBtn"
						color="blue"
						content="Comment"
						disabled={message.length === 0}
						fluid
						type="submit"
						size="big"
					/>
				) : (
					<Button
						className="replyBtn"
						color="blue"
						content="Comment"
						fluid
						onClick={() => props.history.push(`/signin`)}
						size="big"
					/>
				)}
			</Form>
		)

		return (
			<div className="commentsSection">
				{ReplyForm(this.props)}
				{comments.results.length > 0 ? (
					<Comment.Group size="big">{RenderComments(this.props)}</Comment.Group>
				) : (
					<Segment inverted placeholder>
						<Header icon inverted textAlign="center">
							<Icon color="blue" inverted name="comment" />
							No comments
						</Header>
					</Segment>
				)}
			</div>
		)
	}
}

CommentsSection.propTypes = {
	authenticated: PropTypes.bool,
	bearer: PropTypes.string,
	comments: PropTypes.shape({
		count: PropTypes.number,
		results: PropTypes.array
	}),
	id: PropTypes.number,
	fetchComments: PropTypes.func,
	submitComment: PropTypes.func,
	voteOnComment: PropTypes.func
}

CommentsSection.defaultProps = {
	comments: {
		count: 0,
		results: [{}, {}, {}, {}, {}, {}, {}]
	},
	fetchComments,
	postComment,
	voteOnComment
}

const mapStateToProps = (state, ownProps) => ({
	...state.fallacyComments,
	...ownProps
})

export default connect(mapStateToProps, { fetchComments, postComment, voteOnComment })(
	CommentsSection
)
