import "./style.css"
import {
	assignFallacy,
	clearContradiction,
	parseContradiction,
	selectAssignee,
	setContradictionEndTime,
	setContradictionHighlight
} from "./actions"
import { refreshYouTubeToken } from "components/authentication/v1/actions"
import { convertTimeToSeconds } from "utils/textFunctions"
import { connect, Provider } from "react-redux"
import { Button, Dropdown, Form, Icon, Input, Message, Modal, TextArea } from "semantic-ui-react"
import { fallacyDropdownOptions } from "utils/fallacyFunctions"
import _ from "lodash"
import fallacies from "fallacies.json"
import PropTypes from "prop-types"
import React, { Component } from "react"
import SearchForm from "components/search/v1/"
import store from "store"
import Tweet from "components/tweet/v1/"
import YouTubeVideo from "components/youTubeVideo/v1/"

class FallacyForm extends Component {
	constructor(props) {
		super(props)
		this.state = {
			beginTime: "0:00",
			changed: false,
			endTime: "",
			explanation: "",
			highlightedText: "",
			id: 1,
			loading: false,
			open: false,
			title: "",
			url: "",
			visible: true
		}

		this.changeContradictionEndTime = this.changeContradictionEndTime.bind(this)
		this.changeStartTime = this.changeStartTime.bind(this)
		this.closeModal = this.closeModal.bind(this)
		this.handleDismiss = this.handleDismiss.bind(this)
		this.handleHoverOn = this.handleHoverOn.bind(this)
		this.onChangeAssignee = this.onChangeAssignee.bind(this)
		this.onChangeContradiction = this.onChangeContradiction.bind(this)
		this.onChangeEndTime = this.onChangeEndTime.bind(this)
		this.onChangeExplanation = this.onChangeExplanation.bind(this)
		this.onChangeFallacy = this.onChangeFallacy.bind(this)
		this.onChangeTitle = this.onChangeTitle.bind(this)
		this.onPaste = this.onPaste.bind(this)
		this.onSubmitForm = this.onSubmitForm.bind(this)
	}

	changeContradictionEndTime = (e, { value }) => {
		this.props.setContradictionEndTime({ value: convertTimeToSeconds(value) })
	}
	changeStartTime = (e, { value }) => this.setState({ beginTime: value })
	closeModal = () => {
		this.setState({
			explanation: "",
			id: 1,
			open: false,
			title: ""
		})
		this.props.clearContradiction()
		this.props.handleSubmit()
	}
	handleHoverOn = e => {
		let text = ""
		if (window.getSelection) {
			text = window.getSelection().toString()
		} else if (document.selection) {
			text = document.selection.createRange().text
		}
		this.setState({ highlightedText: text })
		this.props.setContradictionHighlight({ text })
	}
	onChangeAssignee = () => this.setState({ changed: true })
	onChangeContradiction = e => {
		if (e.keyCode === 8) {
			this.setState({ url: "" })
			this.props.clearContradiction()
		}
	}
	onChangeEndTime = (e, { value }) => this.setState({ endTime: value })
	onChangeExplanation = (e, { value }) => this.setState({ explanation: value })
	onChangeFallacy = (e, { value }) => this.setState({ id: value })
	onChangeTitle = (e, { value }) => this.setState({ title: value })
	onPaste = e => {
		const value = e.clipboardData.getData("Text")
		this.setState({ url: value })
		this.props.parseContradiction({
			bearer: this.props.bearer,
			url: value
		})
	}
	onSubmitForm(e) {
		// Make sure that a fallacy assigned to a tweet with a contradiction as a tweet is from the same twitter profile
		const state = store.getState()
		const postPage = state.post.pageInfo ? state.post.pageInfo : this.props.pageInfo
		const formPage = state.fallacyForm.pageInfo
			? state.fallacyForm.pageInfo
			: this.props.pageInfo

		let page = formPage
		if (this.props.info) {
			if (this.props.info.comment) {
				page = postPage
			}
		}

		let contradiction = this.props.fallacy.contradiction
		if (
			contradiction.network === "twitter" &&
			parseInt(page.id, 10) !== parseInt(contradiction.pageId, 10)
		) {
			return false
		}

		if (
			contradiction.network === "youtube" &&
			this.props.network === "youtube" &&
			page.type === "youtube" &&
			contradiction.pageId !== page.id
		) {
			return false
		}

		this.setState({
			loading: true,
			open: true
		})
		contradiction = !_.isEmpty(contradiction)
			? !contradiction.error
				? JSON.stringify(contradiction)
				: null
			: null
		this.props.assignFallacy({
			bearer: this.props.bearer,
			contradiction: contradiction,
			commentId: this.props.commentId,
			endTime: convertTimeToSeconds(this.state.endTime),
			explanation: this.state.explanation,
			fallacyId: this.state.id,
			highlightedText: this.props.highlightedText,
			network: this.props.network,
			objectId: this.props.objectId,
			pageId: page.id,
			startTime: this.state.beginTime
				? convertTimeToSeconds(this.state.beginTime)
				: this.props.info.currentTime,
			title: this.state.title
		})
		const title = `${page.name} has been assigned a fallacy`
		this.props.sendNotification(
			title,
			this.state.explanation,
			`https://blather.io/fallacies/150`
		)
	}

	handleDismiss = () => {
		this.setState({ visible: false })
		setTimeout(() => {
			this.setState({ visible: true })
		}, 2000)
	}

	render() {
		const {
			beginTime,
			endTime,
			explanation,
			highlightedText,
			id,
			open,
			title,
			url
		} = this.state
		const currentState = store.getState()
		const contradiction = this.props.fallacy.contradiction
		const contradictionError = contradiction ? contradiction.error : false
		const contradictionErrorMsg = contradiction ? contradiction.errorMsg : false
		const formPage = currentState.fallacyForm.pageInfo
			? currentState.fallacyForm.pageInfo
			: this.props.pageInfo
		const postPage = currentState.post.pageInfo
			? currentState.post.pageInfo
			: this.props.pageInfo

		const page = this.props.info
			? this.props.info.comment
				? postPage
				: formPage
			: this.props.pageInfo

		const canAssign = this.props.info
			? this.props.network === "youtube" && !this.props.commentId
			: false

		let contradictionValid = true
		if (contradiction) {
			if (
				contradiction.network === "twitter" &&
				parseInt(contradiction.pageId, 10) !== parseInt(page.id, 10)
			) {
				contradictionValid = false
			}
			if (
				contradiction.network === "youtube" &&
				this.props.network === "youtube" &&
				page.type === "youtube" &&
				contradiction.pageId !== page.id
			) {
				contradictionValid = false
			}
		}

		if (contradictionError && contradictionErrorMsg === "Refresh token") {
			this.props.refreshYouTubeToken({
				bearer: this.props.bearer
			})
			setTimeout(() => {
				window.location.reload()
			}, 800)
		}

		const ContradictionInput = props => {
			const hasContradiction = contradiction ? contradiction.data : false
			if (id === "21") {
				const contClassName = contradiction ? " active" : ""
				return (
					<Form.Field>
						<Input
							className="contradictionInput"
							icon="paperclip"
							iconPosition="left"
							onKeyUp={this.onChangeContradiction}
							onPaste={this.onPaste}
							placeholder="Link to contradiction"
							value={url}
						/>
						{hasContradiction && (
							<div className={`contradictionWrapper${contClassName}`}>
								{DisplayContradiction(props)}
								{ContradictionMsg(props)}
								{StartTime(props, true)}
							</div>
						)}
					</Form.Field>
				)
			}
			return null
		}
		const ContradictionMsg = props => {
			let msg = ""
			if (contradiction.error) {
				msg = contradiction.errorMsg
			} else if (contradiction.network === "twitter" && !contradictionValid) {
				if (props.info.comment === null) {
					msg = `Only tweets from ${
						page.name
					} can be used for doublethink. Try a tweet from ${
						page.name
					} or a YouTube video featuring ${page.name}.`
				} else {
					msg = `Only comments and videos from ${page.name} can be used for doublethink.`
				}
			} else if (contradiction.network === "youtube" && !contradictionValid) {
				if (page.type === "youtube") {
					msg = `Only comments and videos from ${page.name} can be used for doublethink.`
				}
				if (page.type === "twitter") {
					msg = `YouTube comments cannot be used for doublethink when the fallacy is assigned to a Twitter user in the video. 

                    Change the assignee to ${page.name}'s YouTube channel.`
				}
			}
			if (contradiction.error || !contradictionValid) {
				return <Message className="contradictionMsg" content={msg} error />
			}
			return null
		}
		const DisplayContradiction = props => {
			switch (contradiction.network) {
				case "twitter":
					const tweet = contradiction.data
					return (
						<Tweet
							created_at={tweet.created_at}
							extended_entities={tweet.extended_entities}
							full_text={tweet.full_text}
							handleHoverOn={this.handleHoverOn}
							highlight={highlightedText !== ""}
							highlightedText={highlightedText}
							id={tweet.id_str}
							is_quote_status={tweet.is_quote_status}
							quoted_status={
								tweet.quoted_status === undefined && tweet.is_quote_status
									? tweet.retweeted_status
									: tweet.quoted_status
							}
							quoted_status_id_str={tweet.quoted_status_id_str}
							quoted_status_permalink={tweet.quoted_status_permalink}
							retweeted_status={
								tweet.retweeted_status === undefined
									? false
									: props.post.data.retweeted_status
							}
							stats={{
								favorite_count: tweet.favorite_count,
								retweet_count: tweet.retweet_count
							}}
							user={tweet.user}
						/>
					)
				case "youtube":
					let video = contradiction.data
					let comment = null
					let showVideo = true
					if (contradiction.type === "comment") {
						comment = {
							dateCreated: video.date_created,
							id: video.id,
							likeCount: video.like_count,
							message: video.message,
							user: video.commenter
						}
						showVideo = false
					}

					return (
						<YouTubeVideo
							bearer={props.bearer}
							changeEndTime={this.changeContradictionEndTime}
							channel={video.channel}
							comment={comment}
							contradiction
							dateCreated={video.date_created}
							id={contradiction.mediaId}
							placeholder={video.img}
							publishedAt={video.date_created}
							showComment={comment !== null}
							showComments={false}
							showStats={false}
							showTimes
							showVideo={showVideo}
							startTime={contradiction.startTime}
							title={video.title}
						/>
					)
				default:
					return null
			}
		}
		const ErrorMsg = ({ props }) => {
			if (props.fallacyFormError && props.fallacyFormErrorMsg) {
				return <Message content={props.fallacyFormErrorMsg} error />
			}
			return null
		}
		const SelectAssignee = props => (
			<SearchForm
				defaultValue={props.info.channel ? props.info.channel.title : null}
				onChangeAssignee={this.onChangeAssignee}
				placeholder="Who in this video should the fallacy be assigned to?"
				source="fallacyForm"
				width={"100%"}
			/>
		)
		const StartTime = (props, contradiction = false) => {
			if (
				contradiction
					? contradiction.network === "youtube" && !contradiction.commentId
					: props.network === "youtube" && !props.commentId
			) {
				return (
					<Form.Group widths="equal">
						<Form.Field>
							<label>Video will start at</label>
							<Input
								className={contradiction ? "contradictionStartTime" : "startTime"}
								onChange={this.changeStartTime}
								placeholder="Start time"
								value={beginTime}
							/>
						</Form.Field>
						<Form.Field>
							<label>End at</label>
							<Input
								className={contradiction ? "contradictionEndTime" : "endTime"}
								onChange={this.onChangeEndTime}
								placeholder="End time"
								value={endTime}
							/>
						</Form.Field>
					</Form.Group>
				)
			}
			return null
		}
		const SuccessModal = props => {
			if (props.assigned) {
				const assigneeLink = page.type === "youtube" ? page.id : page.username
				return (
					<Modal
						centered={false}
						className="successModal"
						inverted="true"
						onClose={this.closeModal}
						open={open}
						size="small"
					>
						<Modal.Header>
							<Icon color="green" name="check" /> Your fallacy has been assigned
						</Modal.Header>
						<Modal.Content>
							<p>
								<a
									href={`/pages/${page.type}/${assigneeLink}`}
									onClick={() => {
										this.props.clearContradiction()
										this.props.history.push(
											`/pages/${page.type}/${assigneeLink}`
										)
									}}
								>
									{page.name}
								</a>{" "}
								will have the opportunity to respond to this accusation of
								fallacious reasoning and counter your claim.
							</p>
							<div className="modalBtnWrapper">
								<Button.Group>
									<Button
										color="blue"
										content="View this fallacy"
										onClick={() => {
											this.props.clearContradiction()
											this.props.history.push(
												`/fallacies/${props.fallacy.id}`
											)
										}}
									/>
									<Button.Or />
									<Button
										color="red"
										content="Assign another one"
										onClick={this.closeModal}
										positive
									/>
								</Button.Group>
							</div>
						</Modal.Content>
					</Modal>
				)
			}
			return null
		}

		return (
			<Provider store={store}>
				<div className="fallacyForm">
					<Message
						attached
						className="headerMsg"
						content="Assign a fallacy"
						header="Does this logic make sense?"
						size="large"
					/>
					<Form
						className="attached fluid segment"
						error={
							this.props.fallacyFormError || contradictionError || !contradictionValid
						}
						loading={this.props.loading}
						onSubmit={this.onSubmitForm}
					>
						{canAssign && (
							<div>
								{StartTime(this.props)}
								<div className="selectAssignee">{SelectAssignee(this.props)}</div>
							</div>
						)}
						<Form.Field>
							<Dropdown
								className="fallacyDropdown"
								defaultValue={"1"}
								fluid
								onChange={this.onChangeFallacy}
								options={fallacyDropdownOptions}
								placeholder="Select a fallacy"
								search
								selection
							/>
						</Form.Field>
						{ContradictionInput(this.props)}
						<Form.Field>
							<Input
								className="titleField"
								fluid
								onChange={this.onChangeTitle}
								placeholder="Title"
								value={title}
							/>
						</Form.Field>
						<Form.Field className="explanationField">
							<TextArea
								autoHeight
								onChange={this.onChangeExplanation}
								placeholder="Explain how this is a fallacy"
								rows={8}
								value={explanation}
							/>
						</Form.Field>
						<ErrorMsg props={this.props} />
						{this.props.authenticated ? (
							<Button color="blue" compact content="Assign" fluid type="submit" />
						) : (
							<Button.Group fluid>
								<Button
									content="Assign anonymously"
									icon="spy"
									secondary
									type="submit"
								/>
								<Button.Or />
								<Button
									content="Sign up"
									icon="sign in"
									primary
									onClick={() => this.props.history.push("/signin")}
								/>
							</Button.Group>
						)}
						<p className="commonMarkLink">
							<a
								href="https://spec.commonmark.org/0.28/"
								rel="noopener noreferrer"
								target="_blank"
							>
								view commonmark specs
							</a>
							<span className="clearfix" />
						</p>
					</Form>
					<div>{SuccessModal(this.props)}</div>
				</div>
			</Provider>
		)
	}
}

FallacyForm.propTypes = {
	assigned: PropTypes.bool,
	assignFallacy: PropTypes.func,
	authenticated: PropTypes.bool,
	bearer: PropTypes.string,
	clearContradiction: PropTypes.func,
	commentId: PropTypes.string,
	fallcyFormError: PropTypes.bool,
	fallacyFormErrorCode: PropTypes.number,
	fallacyFormErrorMsg: PropTypes.string,
	fallacies: PropTypes.array,
	fallacy: PropTypes.shape({
		assignedBy: PropTypes.number,
		contradiction: PropTypes.shape({
			commentId: PropTypes.string,
			data: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
			duration: PropTypes.number,
			endTime: PropTypes.string,
			error: PropTypes.bool,
			errorMsg: PropTypes.string,
			mediaId: PropTypes.string,
			network: PropTypes.string,
			pageId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
			startTime: PropTypes.string,
			type: PropTypes.string,
			username: PropTypes.string
		}),
		duration: PropTypes.number,
		explanation: PropTypes.string,
		fallacyId: PropTypes.number,
		id: PropTypes.number,
		title: PropTypes.string
	}),
	handleSubmit: PropTypes.func,
	highlightedText: PropTypes.string,
	network: PropTypes.string,
	objectId: PropTypes.string,
	pageInfo: PropTypes.shape({
		id: PropTypes.string,
		name: PropTypes.string,
		type: PropTypes.string,
		username: PropTypes.string
	}),
	parseContradiction: PropTypes.func,
	sendNotification: PropTypes.func,
	setContradictionEndTime: PropTypes.func,
	setContradictionHighlight: PropTypes.func,
	user: PropTypes.object,
	username: PropTypes.string
}

FallacyForm.defaultProps = {
	assigned: false,
	assignFallacy: assignFallacy,
	clearContradiction: clearContradiction,
	commentId: null,
	fallacies: fallacies,
	fallacy: {
		contradiction: {}
	},
	handleSubmit: () => null,
	setContradictionEndTime: setContradictionEndTime,
	setContradictionHighlight: setContradictionHighlight
}

const mapStateToProps = (state, ownProps) => ({
	...state.fallacyForm,
	...state.post,
	...ownProps
})

export default connect(
	mapStateToProps,
	{
		assignFallacy,
		clearContradiction,
		parseContradiction,
		refreshYouTubeToken,
		selectAssignee,
		setContradictionEndTime,
		setContradictionHighlight
	}
)(FallacyForm)
