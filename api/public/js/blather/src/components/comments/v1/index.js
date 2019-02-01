import "./style.css"
import { fetchComments, postComment } from "pages/actions/fallacy"
import { adjustTimezone } from "utils/dateFunctions"
import { connect } from "react-redux"
import { Button, Comment, Form } from "semantic-ui-react"
import Moment from "react-moment"
import defaultImg from "images/trump.svg"
import LazyLoad from "components/lazyLoad/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"

class CommentsSection extends Component {
	constructor(props) {
		super(props)
		this.state = {
			message: ""
		}
		this.onChangeMessage = this.onChangeMessage.bind(this)
		this.onSubmitForm = this.onSubmitForm.bind(this)
	}

	componentWillMount() {
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
								<Comment.Text>{comment.message}</Comment.Text>
							</Comment.Content>
						</Comment>
					)
				})
			}

			if (props.comments.count === 0) {
				return <p className="emptyMsg">No comments yet...</p>
			}

			return [{}, {}, {}, {}, {}, {}, {}].map((comment, i) => (
				<LazyLoad key={`lazyLoadComment_${i}`} />
			))
		}

		const ReplyForm = props => (
			<Form onSubmit={this.onSubmitForm}>
				<Form.TextArea
					autoHeight
					onChange={this.onChangeMessage}
					placeholder={placeholder}
					value={message}
				/>
				<Button className="replyBtn" color="blue" compact content="Post" type="submit" />
				<div className="clearfix" />
			</Form>
		)

		return (
			<div className="commentsSection">
				{this.props.authenticated && <div>{ReplyForm(this.props)}</div>}
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
	fetchComments: fetchComments,
	postComment: postComment
}

const mapStateToProps = (state, ownProps) => ({
	...state.fallacy,
	...ownProps
})

export default connect(
	mapStateToProps,
	{ fetchComments, postComment }
)(CommentsSection)
