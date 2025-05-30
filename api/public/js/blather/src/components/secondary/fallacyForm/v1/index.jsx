import "./style.css"
import {
	assignFallacy,
	clearContradiction,
	parseContradiction,
	selectAssignee,
	setBeginTime,
	setContradictionBeginTime,
	setContradictionEndTime,
	setContradictionHighlight,
	setEndTime,
	toggleModal
} from "./actions"
import { refreshYouTubeToken } from "components/secondary/authentication/v1/actions"
import { connect, Provider } from "react-redux"
import {
	Button,
	Card,
	Dropdown,
	Form,
	Header,
	Icon,
	Input,
	Message,
	Modal,
	Segment,
	TextArea
} from "semantic-ui-react"
import { fallacyDropdownOptions } from "utils/fallacyFunctions"
import { convertTimeToSeconds } from "utils/textFunctions"
import _ from "lodash"
import fallacies from "options/fallacies.json"
import FallacyRef from "components/primary/fallacyRef/v1/"
import PropTypes from "prop-types"
import React, { Component, Fragment } from "react"
import SearchForm from "components/primary/search/v1/"
import store from "store"
import TimeField from "react-simple-timefield"
import Tweet from "components/primary/tweet/v1/"
import YouTubeCommentsSection from "components/secondary/youTubeVideo/v1/comments"
import YouTubeVideo from "components/secondary/youTubeVideo/v1/"

class FallacyForm extends Component {
	constructor(props) {
		super(props)

		const { fallacyId } = this.props
		const fallacy = fallacyDropdownOptions.filter(item => item.value.toString() === fallacyId)
		const title = fallacy[0].text

		this.state = {
			changed: false,
			contradictionBeginTime: "0",
			contradictionEndTime: "0",
			contradictionQ: "",
			explanation: "",
			formVisible: false,
			highlightedText: "",
			id: fallacyId,
			loading: false,
			title,
			url: "",
			visible: true
		}
	}

	componentDidMount() {
		this.setState({ formVisible: true })
	}

	componentWillUpdate(newProps) {
		if (this.props.startTime !== newProps.startTime) {
			this.props.setBeginTime({ value: newProps.startTime })
		}

		if (this.props.endTime !== newProps.endTime) {
			this.props.setEndTime({ value: newProps.endTime })
		}
	}

	changeContradictionBeginTime = time => this.props.setContradictionBeginTime({ value: time })

	changeContradictionEndTime = time => this.props.setContradictionEndTime({ value: time })

	closeModal = () => {
		this.setState(
			{
				explanation: "",
				id: "1",
				title: "",
				url: ""
			},
			() => {
				this.props.toggleModal()
				this.props.clearContradiction()
				this.props.handleSubmit()
			}
		)
	}

	checkValidity = (c, type) => {
		const page = this.whichPage()
		let valid = true
		let msg = ""
		switch (type) {
			case "comment":
				if ((c.type === "comment" || c.type === "video") && page.id !== c.pageId) {
					msg = `Only comments and/or videos from ${page.name} can be used as evidence in cases of doublethink.`
					valid = false
				}
				if (c.type === "tweet") {
					msg = `Only comments and/or videos from ${page.name} can be used as evidence in cases of doublethink.`
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
					msg = `Comments can be used as evidence of doublethink. But, they have to be from ${page.name}.`
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

	onChangeContradictionQ = (e, { value }) => this.setState({ contradictionQ: value })

	onChangeEndTime = time => this.props.setEndTime({ value: time })

	onChangeExplanation = (e, { value }) => this.setState({ explanation: value })

	onChangeFallacy = (e, { value }) => {
		this.props.clearContradiction()
		const fallacy = fallacyDropdownOptions.filter(item => item.value === value)
		const title = fallacy[0].text
		this.setState({ id: value, title })
	}

	onChangeStartTime = time => this.props.setBeginTime({ value: time })

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

	onSubmitForm = e => {
		this.setState({ loading: true })
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

		const _state = store.getState()
		this.props.assignFallacy({
			bearer: this.props.bearer,
			callback: () => this.setState({ loading: false }),
			contradiction,
			commentId: this.props.commentId,
			endTime: convertTimeToSeconds(_state.fallacyForm.endTime),
			explanation: this.state.explanation,
			fallacyId: this.state.id,
			highlightedText: this.props.highlightedText,
			history: this.props.history,
			network: this.props.network,
			objectId: this.props.objectId,
			pageId: page.id,
			startTime: convertTimeToSeconds(_state.fallacyForm.startTime),
			title: this.state.title
		})
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
		const { contradictionQ, explanation, highlightedText, id, loading, url } = this.state
		let { bearer, fallacy, info, type } = this.props

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
					<Fragment>
						<Form.Field>
							<Input
								className="contradictionInput"
								icon="paperclip inverted"
								onKeyUp={this.onChangeContradiction}
								onPaste={this.onPaste}
								placeholder="Link to contradicting tweet"
								value={url}
							/>
							{hasContradiction && (
								<div className={`contradictionWrapper${contClassName}`}>
									{DisplayContradiction(props)}
									{ContradictionMsg(props)}
								</div>
							)}
						</Form.Field>
						<Segment className="searchContradictionSegment" inverted>
							<Form.Field>
								<Input
									className="contradictionInput"
									icon="search inverted"
									iconPosition="left"
									onChange={this.onChangeContradictionQ}
									placeholder="Search for an old tweet"
									size="large"
									value={contradictionQ}
								/>
							</Form.Field>
							<Form.Field>
								<Button
									color="twitter"
									content={`Search old tweets for "${contradictionQ}"`}
									disabled={contradictionQ === ""}
									fluid
									icon="twitter"
									// inverted
									onClick={e => {
										e.preventDefault()
										window.open(
											`https://twitter.com/search?q=${contradictionQ} from:${props.pageInfo.username}&src=typed_query`,
											"_blank"
										)
									}}
									size="large"
								/>
							</Form.Field>
						</Segment>
					</Fragment>
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
							displayTextRange={tweet.display_text_range}
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
									: tweet.retweeted_status
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
							endTime={c.endTime ? c.endTime : "0"}
							id={c.mediaId}
							placeholder={video.img}
							publishedAt={video.date_created}
							showStats={false}
							showTimes
							source="fallacy"
							startTime={c.startTime ? c.startTime : "0"}
							title={video.title}
						/>
					)
				default:
					return null
			}
		}

		const SelectAssignee = props => (
			<SearchForm
				category={false}
				defaultValue={page ? page.name : null}
				onChangeAssignee={this.onChangeAssignee}
				placeholder="Who should this fallacy be assigned to?"
				size="medium"
				source="fallacyForm"
				width={"100%"}
			/>
		)

		const StartTime = props => {
			if (props.type === "video" && info !== undefined && !info.comment) {
				return (
					<Form.Group inverted widths="equal">
						<Form.Field>
							<TimeField
								input={
									<Input
										className="startTime"
										icon="hourglass start"
										placeholder="Start time"
										size={props.size}
									/>
								}
								onChange={this.onChangeStartTime}
								showSeconds
								value={props.startTime}
							/>
						</Form.Field>
						<Form.Field>
							<TimeField
								input={
									<Input
										className="endTime"
										icon="hourglass end"
										placeholder="End time"
										size={props.size}
									/>
								}
								onChange={this.onChangeEndTime}
								showSeconds
								value={props.endTime}
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
							<Icon color="green" inverted name="check" /> Your fallacy has been
							assigned
						</Modal.Header>
						<Modal.Content>
							<Modal.Description>
								<Header size="small">
									<a
										href={`/pages/${page.type}/${assigneeLink}`}
										onClick={() => {
											props.clearContradiction()
											props.history.push(
												`/pages/${page.type}/${assigneeLink}`
											)
										}}
									>
										{page.name}
									</a>{" "}
									will have the opportunity to respond to this accusation of
									fallacious reasoning and counter your claim.
								</Header>
							</Modal.Description>
						</Modal.Content>
						<Modal.Actions>
							<Button
								color="blue"
								content="View this fallacy"
								onClick={() => {
									props.toggleModal()
									props.clearContradiction()
									props.history.push(`/fallacies/${props.fallacy.id}`)
								}}
							/>
							<Button
								color="red"
								content="Assign another one"
								onClick={this.closeModal}
								positive
								size={props.size}
							/>
						</Modal.Actions>
					</Modal>
				)
			}
			return null
		}

		const MainForm = props => (
			<Form
				error={props.fallacyFormError || cError || !cValid}
				onSubmit={this.onSubmitForm}
				size={props.size}
				unstackable
			>
				{canAssign && (
					<div>
						{StartTime(props)}
						<div className="selectAssignee">{SelectAssignee(props)}</div>
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
						size="large"
					/>
					<FallacyRef
						canScreenshot={false}
						className="fallacyRef"
						id={parseInt(id, 10)}
						includeHeader={false}
						showDialogue={false}
						size={props.size}
					/>
				</Form.Field>
				{ContradictionInput(props)}
				<Form.Field className="explanationField">
					<TextArea
						autoHeight
						onChange={this.onChangeExplanation}
						placeholder="Explain how this is a fallacy"
						rows={5}
						value={explanation}
					/>
				</Form.Field>
				<Button
					color="blue"
					content="Assign"
					fluid
					loading={loading}
					size={props.size}
					type="submit"
				/>
				<div className="clearfix" />
			</Form>
		)

		return (
			<Provider store={store}>
				{this.props.useCard ? (
					<Card className={`fallacyForm ${this.props.size}`} fluid>
						<Card.Content>
							<Card.Header className="formHeader">Does this make sense?</Card.Header>
							<Card.Meta>Assign a fallacy</Card.Meta>
						</Card.Content>
						<Card.Content>{MainForm(this.props)}</Card.Content>
					</Card>
				) : (
					<div className="fallacyForm">{MainForm(this.props)}</div>
				)}

				<div>{SuccessModal(this.props)}</div>
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
	endTime: PropTypes.string,
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
	fallacyId: PropTypes.string,
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
	size: PropTypes.string,
	startTime: PropTypes.string,
	toggleModal: PropTypes.func,
	useCard: PropTypes.bool
}

FallacyForm.defaultProps = {
	assignFallacy,
	clearContradiction,
	commentId: null,
	endTime: "0",
	fallacies,
	fallacyFormError: null,
	fallacy: {
		contradiction: {}
	},
	fallacyId: "21",
	handleSubmit: () => null,
	modalOpen: false,
	setContradictionBeginTime,
	setContradictionEndTime,
	setContradictionHighlight,
	size: "big",
	startTime: "0",
	toggleModal,
	useCard: true
}

const mapStateToProps = (state, ownProps) => ({
	...state.fallacyForm,
	...state.post,
	...ownProps
})

export default connect(mapStateToProps, {
	assignFallacy,
	clearContradiction,
	parseContradiction,
	refreshYouTubeToken,
	selectAssignee,
	setBeginTime,
	setContradictionBeginTime,
	setContradictionEndTime,
	setContradictionHighlight,
	setEndTime,
	toggleModal
})(FallacyForm)
