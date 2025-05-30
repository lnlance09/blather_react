import "./style.css"
import * as linkify from "linkifyjs"
import { fetchComments, likeComment, postComment, unlikeComment } from "./actions"
import { adjustTimezone } from "utils/dateFunctions"
import { connect } from "react-redux"
import { Button, Comment, Form, Header, Icon, Segment, TextArea } from "semantic-ui-react"
import ImagePic from "images/images/image-square.png"
import Moment from "react-moment"
import defaultImg from "images/avatar/small/steve.jpg"
import LazyLoad from "components/primary/lazyLoad/v1/"
import Linkify from "linkifyjs/react"
import mention from "linkifyjs/plugins/mention"
import PropTypes from "prop-types"
import React, { Fragment, useEffect, useRef, useState } from "react"
import ReactTooltip from "react-tooltip"

mention(linkify)

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
	redirectToComment,
	showEmptyMsg,
	showReplies,
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

	const onSubmitForm = () => {
		if (message !== "") {
			postComment({
				bearer,
				callback: () => {
					setMessage("")
					setResponseTo(null)
				},
				id,
				message,
				responseTo
			})
		}
	}

	const SingleComment = (comment, commentId, isReply, key) => {
		return (
			<Fragment>
				<Comment key={key}>
					<Comment.Avatar
						as="a"
						data-for={key}
						data-iscapture="true"
						data-tip={`${comment.username}`}
						onClick={() => history.push(`/users/${comment.username}`)}
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
							<Linkify
								options={{
									formatHref: { mention: val => `/users${val}` },
									target: "_blank"
								}}
							>
								{comment.message}
							</Linkify>
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

										if (isReply) {
											payload.commentId = commentId
											payload.responseId = comment.id
										}

										if (parseInt(comment.likedByMe, 10) === 1) {
											unlikeComment(payload)
										} else {
											likeComment(payload)
										}
									}}
								>
									<Icon
										color={
											parseInt(comment.likedByMe, 10) === 1 ? "yellow" : null
										}
										inverted
										name="thumbs up"
									/>{" "}
									{parseInt(comment.likedByMe, 10) === 1 ? (
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
											setResponseTo(commentId)
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

				<ReactTooltip
					className="tooltipClass"
					effect="solid"
					id={key}
					multiline={false}
					place="left"
					type="light"
				/>
			</Fragment>
		)
	}

	const ReplyForm = (
		<div ref={blockRef}>
			<Form inverted onSubmit={onSubmitForm} size="large">
				<TextArea
					autoHeight
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
						size="large"
					/>
				) : (
					<Button
						className="replyBtn"
						color="blue"
						content="Comment"
						fluid
						onClick={() => history.push(`/signin`)}
						size="large"
					/>
				)}
			</Form>
		</div>
	)

	return (
		<div className="commentsSection">
			{ReplyForm}
			{comments.results.length > 0 ? (
				<Comment.Group className="commentsGroup" size="large">
					{comments.results.map((comment, i) => {
						const { responses } = comment
						if (typeof comment.id === "undefined") {
							return <LazyLoad key={`comment${i}`} />
						}

						return (
							<Comment
								className={`${redirectToComment ? "redirect" : ""}`}
								key={`individualComment${i}`}
								id={comment.id}
							>
								{SingleComment(comment, comment.id, false, `individualComment${i}`)}

								{responses && responses.length > 0 && showReplies && (
									<Comment.Group size="large">
										{responses.map((response, x) => {
											if (response.id !== null) {
												return (
													<Comment
														className={`${
															redirectToComment ? "redirect" : ""
														}`}
														id={`${comment.id}${response.id}`}
														key={`replyComment${x}`}
													>
														{SingleComment(
															response,
															comment.id,
															true,
															`replyComment${i}`
														)}
													</Comment>
												)
											}

											return null
										})}
									</Comment.Group>
								)}
							</Comment>
						)
					})}
				</Comment.Group>
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
	redirectToComment: PropTypes.bool,
	showEmptyMsg: PropTypes.bool,
	showReplies: PropTypes.bool,
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
	redirectToComment: false,
	showEmptyMsg: true,
	showReplies: true,
	unlikeComment
}

const mapStateToProps = (state, ownProps) => ({
	...state.fallacyComments,
	...ownProps
})

export default connect(mapStateToProps, { fetchComments, likeComment, postComment, unlikeComment })(
	CommentsSection
)
