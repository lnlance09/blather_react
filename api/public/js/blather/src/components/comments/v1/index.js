import "./style.css"
import { fetchComments, postComment } from "./actions"
import { adjustTimezone } from "utils/dateFunctions"
import { connect } from "react-redux"
import { Button, Comment, Form } from "semantic-ui-react"
import ImagePic from "images/images/image-square.png"
import Moment from "react-moment"
import defaultImg from "images/trump.svg"
import LazyLoad from "components/lazyLoad/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import Linkify from "react-linkify"

class CommentsSection extends Component {
	constructor(props) {
		super(props)
		this.state = {
			message: ""
		}

		this.onChangeMessage = this.onChangeMessage.bind(this)
		this.onSubmitForm = this.onSubmitForm.bind(this)
	}

	componentDidMount() {
		this.props.fetchComments({
			id: this.props.id,
			page: 0
		})
	}

	onChangeMessage = (e, { value }) => this.setState({ message: value })

	onSubmitForm(e) {
		if (this.state.message !== "") {
			this.props.postComment({
				bearer: this.props.bearer,
				id: this.props.id,
				message: this.state.message
			})
			this.setState({ message: "" })
		}
	}

	render() {
		const { message } = this.state
		const placeholder =
			this.props.comments.count === 0 ? "Be the first to comment..." : "Add a comment..."

		const RenderComments = props => {
			if (props.comments.count > 0) {
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

			if (props.comments.count === 0) {
				return null
			}

			return [{}, {}, {}, {}, {}, {}, {}].map((comment, i) => (
				<LazyLoad key={`lazyLoadComment_${i}`} />
			))
		}

		const ReplyForm = props => (
			<Form onSubmit={this.onSubmitForm}>
				<Form.TextArea
					autoHeight
					// disabled={!props.authenticated}
					onChange={this.onChangeMessage}
					placeholder={placeholder}
					value={message}
				/>
				{props.authenticated ? (
					<Button
						className="replyBtn"
						color="blue"
						content="Add a comment"
						disabled={!props.authenticated}
						type="submit"
					/>
				) : (
					<Button
						className="replyBtn"
						color="blue"
						content="Sign In to Comment"
						fluid
						onClick={() => props.history.push(`/signin`)}
					/>
				)}
				<div className="clearfix" />
			</Form>
		)

		return (
			<div className="commentsSection">
				{ReplyForm(this.props)}
				<Comment.Group>{RenderComments(this.props)}</Comment.Group>
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
	submitComment: PropTypes.func
}

CommentsSection.defaultProps = {
	comments: {
		count: 0,
		results: [{}, {}, {}, {}, {}, {}, {}]
	},
	fetchComments,
	postComment
}

const mapStateToProps = (state, ownProps) => ({
	...state.fallacyComments,
	...ownProps
})

export default connect(
	mapStateToProps,
	{ fetchComments, postComment }
)(CommentsSection)
