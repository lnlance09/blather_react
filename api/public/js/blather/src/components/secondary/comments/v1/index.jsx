import "./style.css"
import { fetchComments, likeComment, postComment, unlikeComment } from "./actions"
import { adjustTimezone } from "utils/dateFunctions"
import { connect } from "react-redux"
import { Button, Comment, Form, Header, Icon, Segment, TextArea } from "semantic-ui-react"
import ImagePic from "images/images/image-square.png"
import Moment from "react-moment"
import defaultImg from "images/avatar/small/steve.jpg"
import Linkify from "react-linkify"
import PropTypes from "prop-types"
import React, { Fragment, useEffect, useRef, useState } from "react"

const CommentsSection = ({
	allowReplies,
	authenticated,
	bearer,
	comments,
	fetchComments,
	history,
	id,
	likeComment,
	postComment,
	showEmptyMsg,
	unlikeComment
}) => {
	const blockRef = useRef(null)
	const textAreaRef = useRef(null)

	const [message, setMessage] = useState("")
	const [responseTo, setResponseTo] = useState(null)

	useEffect(() => {
		fetchComments({
			bearer,
			id,
			page: 0
		})
	}, [])

	const onSubmitForm = e => {
		if (message !== "") {
			postComment({
				bearer,
				callback: () => setMessage(""),
				id,
				message
			})
		}
	}

	const RenderComments = () => {
		return comments.results.map((comment, i) => {
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
							onClick={() => history.push(`/users/${comment.username}`)}
						>
							{comment.name}
						</Comment.Author>
						<Comment.Metadata>
							<div>
								<Moment date={adjustTimezone(comment.created_at)} fromNow />
							</div>
						</Comment.Metadata>
						<Comment.Text>
							<Linkify properties={{ target: "_blank" }}>{comment.message}</Linkify>
						</Comment.Text>
						<Comment.Actions>
							<Comment.Action>
								<span
									onClick={() => {
										if (!authenticated) {
											history.push("/signin?type=join")
											return
										}

										const payload = {
											bearer,
											commentId: comment.id
										}

										if (comment.isReply) {
											payload.commentId = comment.id
											payload.responseId = comment.responseId
										}

										if (comment.likedByMe === "1") {
											unlikeComment(payload)
										} else {
											likeComment(payload)
										}
									}}
								>
									<Icon
										color={comment.likedByMe === "1" ? "yellow" : null}
										inverted
										name="thumbs up"
									/>{" "}
									{comment.likedByMe === "1" ? (
										<span className="likeThis">Liked</span>
									) : (
										<span>Like</span>
									)}
								</span>
								{comment.likeCount > 0 && (
									<span className="likeCount">{comment.likeCount}</span>
								)}
							</Comment.Action>
							{allowReplies && (
								<Comment.Action>
									<span
										onClick={() => {
											setMessage(`@${comment.username} `)
											setResponseTo(comment.id)
											window.scrollTo({
												behavior: "smooth",
												top: blockRef.current.offsetTop
											})
											textAreaRef.current.focus()
										}}
									>
										<Icon inverted name="reply" /> Reply
									</span>
								</Comment.Action>
							)}
						</Comment.Actions>
					</Comment.Content>
				</Comment>
			)
		})
	}

	const ReplyForm = (
		<div ref={blockRef}>
			<Form inverted onSubmit={onSubmitForm} size="big">
				<TextArea
					autoHeight
					inverted
					onChange={(e, { value }) => setMessage(value)}
					placeholder={
						comments.count === 0 ? "Be the first to comment..." : "Add a comment..."
					}
					ref={textAreaRef}
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
						onClick={() => history.push(`/signin`)}
						size="big"
					/>
				)}
			</Form>
		</div>
	)

	return (
		<div className="commentsSection">
			{ReplyForm}
			{comments.results.length > 0 ? (
				<Comment.Group size="big">{RenderComments()}</Comment.Group>
			) : (
				<Fragment>
					{showEmptyMsg && (
						<Segment inverted placeholder>
							<Header icon inverted textAlign="center">
								<Icon color="blue" inverted name="comment" />
								No comments
							</Header>
						</Segment>
					)}
				</Fragment>
			)}
		</div>
	)
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
	likeComment: PropTypes.func,
	showEmptyMsg: PropTypes.bool,
	submitComment: PropTypes.func,
	unlikeComment: PropTypes.func
}

CommentsSection.defaultProps = {
	comments: {
		count: 0,
		results: [{}, {}, {}, {}, {}, {}, {}]
	},
	fetchComments,
	likeComment,
	postComment,
	showEmptyMsg: true,
	unlikeComment
}

const mapStateToProps = (state, ownProps) => ({
	...state.fallacyComments,
	...ownProps
})

export default connect(mapStateToProps, { fetchComments, likeComment, postComment, unlikeComment })(
	CommentsSection
)
