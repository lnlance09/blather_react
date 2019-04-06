import "./style.css"
import {
	assignFallacy,
	clearContradiction,
	parseContradiction,
	selectAssignee,
	setContradictionBeginTime,
	setContradictionEndTime,
	setContradictionHighlight,
	toggleModal
} from "./actions"
import { refreshYouTubeToken } from "components/authentication/v1/actions"
import { connect, Provider } from "react-redux"
import {
	Button,
	Dropdown,
	Form,
	Header,
	Icon,
	Input,
	Message,
	Modal,
	TextArea
} from "semantic-ui-react"
import { fallacyDropdownOptions } from "utils/fallacyFunctions"
import { convertTimeToSeconds } from "utils/textFunctions"
import _ from "lodash"
import fallacies from "fallacies.json"
import PropTypes from "prop-types"
import React, { Component } from "react"
import SearchForm from "components/search/v1/"
import store from "store"
import TimeField from "react-simple-timefield"
import Tweet from "components/tweet/v1/"
import YouTubeCommentsSection from "components/youTubeVideo/v1/comments"
import YouTubeVideo from "components/youTubeVideo/v1/"

class FallacyForm extends Component {
	constructor(props) {
		super(props)
		this.state = {
			beginTime: "0:00",
			changed: false,
			contradictionBeginTime: "0:00",
			contradictionEndTime: "0:00",
			endTime: "",
			explanation: "",
			formVisible: false,
			highlightedText: "",
			id: "21",
			title: "",
			url: "",
			visible: true
		}

		this.changeContradictionBeginTime = this.changeContradictionBeginTime.bind(this)
		this.changeContradictionEndTime = this.changeContradictionEndTime.bind(this)
		this.closeModal = this.closeModal.bind(this)
		this.handleHoverOn = this.handleHoverOn.bind(this)
		this.onChangeAssignee = this.onChangeAssignee.bind(this)
		this.onChangeContradiction = this.onChangeContradiction.bind(this)
		this.onChangeEndTime = this.onChangeEndTime.bind(this)
		this.onChangeExplanation = this.onChangeExplanation.bind(this)
		this.onChangeFallacy = this.onChangeFallacy.bind(this)
		this.onChangeStartTime = this.onChangeStartTime.bind(this)
		this.onChangeTitle = this.onChangeTitle.bind(this)
		this.onPaste = this.onPaste.bind(this)
		this.onSubmitForm = this.onSubmitForm.bind(this)
	}

	changeContradictionBeginTime = time => {
		this.props.setContradictionBeginTime({ value: time })
	}

	changeContradictionEndTime = time => {
		this.props.setContradictionEndTime({ value: time })
	}

	closeModal = () => {
		this.setState({
			explanation: "",
			id: 1,
			title: ""
		})
		this.props.toggleModal()
		this.props.clearContradiction()
		this.props.handleSubmit()
	}

	componentDidMount() {
		this.setState({ formVisible: true })
	}

	checkValidity = (c, type) => {
		const page = this.whichPage()
		let valid = true
		let msg = ""
		switch (type) {
			case "comment":
				if ((c.type === "comment" || c.type === "video") && page.id !== c.pageId) {
					msg = `Only comments and/or videos from ${
						page.name
					} can be used as evidence in cases of doublethink.`
					valid = false
				}
				if (c.type === "tweet") {
					msg = `Only comments and/or videos from ${
						page.name
					} can be used as evidence in cases of doublethink.`
					valid = false
				}
				break

			case "tweet":
				if (c.type === "comment") {
					msg = `YouTube comments can't be used to contradict tweets.`
					valid = false
				}
				if (c.type === "tweet" && page.id !== c.pageId) {
					msg = `Tweets can be used to show how they contradict other tweets. But, they have to be from the same account.`
					valid = false
				}
				break

			case "video":
				if (c.type === "comment" && page.id !== c.pageId) {
					msg = `Comments can be used as evidence of doublethink. But, they have to be from ${
						page.name
					}.`
					valid = false
				}
				break

			default:
				return {
					msg,
					valid
				}
		}

		return {
			msg,
			valid
		}
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

	onChangeEndTime = time => this.setState({ endTime: time })

	onChangeExplanation = (e, { value }) => this.setState({ explanation: value })

	onChangeFallacy = (e, { value }) => {
		this.props.clearContradiction()
		this.setState({ id: value })
	}

	onChangeStartTime = time => this.setState({ beginTime: time })

	onChangeTitle = (e, { value }) => this.setState({ title: value })

	onPaste = e => {
		const value = e.clipboardData.getData("Text")
		this.setState({ url: value })
		this.props.parseContradiction({
			bearer: this.props.bearer,
			type: this.props.type,
			url: value
		})
	}

	onSubmitForm(e) {
		let type = this.props.type
		if (type === "video" && this.props.info.comment) {
			type = "comment"
		}
		const page = this.whichPage()
		const c = this.props.fallacy.contradiction

		let contradiction = null
		if (!_.isEmpty(c) && !c.error) {
			contradiction = JSON.stringify(c)
			const isValid = this.checkValidity(c, type)
			if (!isValid.valid) {
				return false
			}
		}

		this.props.assignFallacy({
			bearer: this.props.bearer,
			contradiction,
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

		/*
		const title = `${page.name} has been assigned a fallacy`
		this.props.sendNotification(
			title,
			this.state.explanation,
			`https://blather.io/fallacies/150`
		)
		*/
	}

	whichPage = () => {
		const state = store.getState()
		let formPage = this.props.pageInfo
		if (state.fallacyForm.pageInfo) {
			formPage = state.fallacyForm.pageInfo
		}

		let postPage = this.props.pageInfo
		if (state.post.pageInfo) {
			postPage = state.post.pageInfo
		}

		let page = formPage
		if (this.props.info && this.props.info.comment) {
			page = postPage
		}
		return page
	}

	render() {
		const { beginTime, endTime, explanation, highlightedText, id, title, url } = this.state
		const { bearer, fallacy, info } = this.props
		let type = this.props.type
		if (type === "video" && info !== undefined && info.comment) {
			type = "comment"
		}
		const page = this.whichPage()
		const canAssign = type === "video"

		const c = fallacy.contradiction
		const cError = c ? c.error : false
		const cErrorMsg = c ? c.errorMsg : false
		let cValid = true
		let cValidMsg = ""

		if (cError && cErrorMsg === "Refresh token") {
			this.props.refreshYouTubeToken({
				bearer
			})
			setTimeout(() => {
				window.location.reload()
			}, 800)
		}

		if (c) {
			let isValid = this.checkValidity(c, type)
			cValid = isValid.valid
			cValidMsg = isValid.msg
		}

		const ContradictionInput = props => {
			const hasContradiction = c ? c.data : false
			if (id === "21") {
				const contClassName = c ? " active" : ""
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
							</div>
						)}
					</Form.Field>
				)
			}
			return null
		}
		const ContradictionMsg = props => {
			const msg = c.error ? cErrorMsg : cValidMsg
			if (!cValid) {
				return <Message className="contradictionMsg" content={msg} error />
			}
			return null
		}
		const DisplayContradiction = props => {
			switch (c.network) {
				case "twitter":
					const tweet = c.data
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
					let video = c.data
					let comment = null
					if (c.type === "comment") {
						comment = {
							dateCreated: video.date_created,
							id: video.id,
							likeCount: video.like_count,
							message: video.message,
							user: video.commenter
						}

						return (
							<YouTubeCommentsSection
								auth={props.authenticated}
								bearer={props.bearer}
								comment={comment}
								handleHoverOn={this.handleHoverOn}
								highlightedText={highlightedText}
								showComment
								showComments={false}
								source="fallacy"
								videoId={c.mediaId}
							/>
						)
					}

					return (
						<YouTubeVideo
							bearer={props.bearer}
							changeEndTime={this.changeContradictionEndTime}
							changeStartTime={this.changeContradictionBeginTime}
							channel={video.channel}
							contradiction
							dateCreated={video.date_created}
							endTime={c.endTime}
							id={c.mediaId}
							placeholder={video.img}
							publishedAt={video.date_created}
							showStats={false}
							showTimes
							startTime={c.startTime}
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
				defaultValue={page ? page.name : null}
				onChangeAssignee={this.onChangeAssignee}
				placeholder="Who in this video should the fallacy be assigned to?"
				source="fallacyForm"
				width={"100%"}
			/>
		)
		const StartTime = props => {
			if (props.type === "video" && info !== undefined && !info.comment) {
				return (
					<Form.Group widths="equal">
						<Form.Field>
							<TimeField
								input={
									<Input
										className={c ? "contradictionStartTime" : "startTime"}
										icon="hourglass start"
										placeholder="Start time"
									/>
								}
								onChange={this.onChangeStartTime}
								showSeconds
								style={{ width: "100%", fontSize: 14 }}
								value={beginTime}
							/>
						</Form.Field>
						<Form.Field>
							<TimeField
								input={
									<Input
										className={c ? "contradictionEndTime" : "endTime"}
										icon="hourglass end"
										placeholder="End time"
									/>
								}
								onChange={this.onChangeEndTime}
								showSeconds
								style={{ width: "100%", fontSize: 14 }}
								value={endTime}
							/>
						</Form.Field>
					</Form.Group>
				)
			}
			return null
		}
		const SuccessModal = props => {
			if (page !== null) {
				const assigneeLink = page.type === "youtube" ? page.id : page.username
				return (
					<Modal
						centered={false}
						className="successModal"
						inverted="true"
						onClose={this.closeModal}
						open={props.modalOpen}
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
										props.clearContradiction()
										props.history.push(`/pages/${page.type}/${assigneeLink}`)
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
											props.toggleModal()
											props.clearContradiction()
											props.history.push(`/fallacies/${props.fallacy.id}`)
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
					<Header>Does this logic make sense?</Header>
					<Form
						className="form basic segment"
						error={this.props.fallacyFormError || cError || !cValid}
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
								defaultValue={id}
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
								rows={5}
								value={explanation}
							/>
						</Form.Field>
						<ErrorMsg props={this.props} />
						{this.props.authenticated ? (
							<Button color="orange" content="Assign a fallacy" fluid type="submit" />
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
						<div className="clearfix" />
					</Form>
					<div>{SuccessModal(this.props)}</div>
				</div>
			</Provider>
		)
	}
}

FallacyForm.propTypes = {
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
			endTime: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
			error: PropTypes.bool,
			errorMsg: PropTypes.string,
			mediaId: PropTypes.string,
			network: PropTypes.string,
			pageId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
			startTime: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
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
	modalOpen: PropTypes.bool,
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
	setContradictionBeginTime: PropTypes.func,
	setContradictionEndTime: PropTypes.func,
	setContradictionHighlight: PropTypes.func,
	toggleModal: PropTypes.func
}

FallacyForm.defaultProps = {
	assignFallacy,
	clearContradiction,
	commentId: null,
	fallacies,
	fallacyFormError: null,
	fallacy: {
		contradiction: {}
	},
	handleSubmit: () => null,
	modalOpen: false,
	setContradictionBeginTime,
	setContradictionEndTime,
	setContradictionHighlight,
	toggleModal
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
		setContradictionBeginTime,
		setContradictionEndTime,
		setContradictionHighlight,
		toggleModal
	}
)(FallacyForm)
