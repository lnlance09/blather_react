import "./style.css"
import { fetchFallacyConversation, submitFallacyConversation } from "pages/actions/fallacy"
import { fetchDiscussionConversation, submitDiscussionConversation } from "pages/actions/discussion"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { TwitterShareButton } from "react-share"
import {
	Button,
	Card,
	Dimmer,
	Divider,
	Dropdown,
	Form,
	Header,
	Icon,
	Image,
	Popup,
	Message,
	Segment,
	TextArea
} from "semantic-ui-react"
import { adjustTimezone } from "utils/dateFunctions"
import Marked from "marked"
import Moment from "react-moment"
import defaultImg from "images/trump.svg"
import ImagePic from "images/image-square.png"
import ParagraphPic from "images/short-paragraph.png"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"

class Conversation extends Component {
	constructor(props) {
		super(props)
		const currentState = store.getState()
		const user = currentState.user
		this.state = {
			copied: false,
			disabled: false,
			extraText: "",
			icon: "paper plane",
			message: "",
			placeholder: null,
			status: 1,
			text: "respond",
			user: user.data,
			value: "respond"
		}

		if (this.props.source === "fallacy" && this.props.fallacyId) {
			this.props.fetchFallacyConversation({
				bearer: this.props.bearer,
				id: this.props.fallacyId
			})
		}

		if (this.props.source === "discussion" && this.props.discussionId) {
			this.props.fetchDiscussionConversation({
				bearer: this.props.bearer,
				id: this.props.discussionId
			})
		}

		Marked.setOptions({
			renderer: new Marked.Renderer(),
			highlight: function(code) {
				// return require('highlight.js').highlightAuto(code).value;
			},
			pedantic: false,
			breaks: false,
			sanitize: false,
			smartLists: true,
			smartypants: false,
			xhtml: false
		})

		this.onChangeMessage = this.onChangeMessage.bind(this)
		this.selectOption = this.selectOption.bind(this)
		this.submitForm = this.submitForm.bind(this)
	}

	onChangeMessage = (e, { value }) => this.setState({ disabled: value === "", message: value })

	selectOption = (e, { icon, status, text, value }) => {
		let extraText = ""
		let placeholder = ""
		switch (status) {
			case 1:
				extraText = ""
				placeholder = `Tell ${this.props.createdBy.name} why this is not a fallacy`
				break
			case 2:
				extraText = "This conversation is a waste of time."
				placeholder = `Why wasn't this conversation with ${
					this.props.createdBy.name
				} productive?`
				break
			case 3:
				extraText = "I've heard enough to be convinced."
				placeholder = `What was it that ${
					this.props.createdBy.name
				} said that changed your mind?`
				break
			default:
		}

		this.setState({
			extraText,
			icon,
			placeholder,
			status,
			text,
			value
		})
	}

	submitForm() {
		this.setState({ message: "" })
		if (this.props.source === "fallacy") {
			this.props.submitFallacyConversation({
				bearer: this.props.bearer,
				id: this.props.fallacyId,
				msg: this.state.message,
				status: this.state.status
			})
		}
		if (this.props.source === "discussion") {
			this.props.submitDiscussionConversation({
				bearer: this.props.bearer,
				id: this.props.discussionId,
				msg: this.state.message,
				status: this.state.status
			})
		}
	}

	render() {
		const {
			copied,
			disabled,
			extraText,
			icon,
			message,
			placeholder,
			status,
			text,
			user,
			value
		} = this.state
		const userId = parseInt(user.id, 10)
		const convoCount = this.props.conversation.length
		const lastExchange = convoCount > 0 ? this.props.conversation[convoCount - 1] : false
		let myTurn = false
		if (this.props.createdBy !== undefined) {
			myTurn =
				(convoCount === 0 && userId !== this.props.createdBy.id) || lastExchange
					? parseInt(lastExchange.user_id, 10) !== userId
					: false
		}

		const ChooseAction = props => (
			<Dropdown icon={false} inline labeled text={text}>
				<Dropdown.Menu>
					<Dropdown.Item
						icon="paper plane"
						onClick={this.selectOption}
						status={1}
						text="respond"
						value="respond"
					/>
					<Dropdown.Item
						disabled={userId !== props.createdBy.id}
						icon="close"
						onClick={this.selectOption}
						status={2}
						text="close this conversation"
						value="close"
					/>
					<Dropdown.Item
						disabled={userId !== props.createdBy.id}
						icon="check"
						onClick={this.selectOption}
						status={3}
						text="change my mind"
						value="convince"
					/>
				</Dropdown.Menu>
			</Dropdown>
		)
		const ContactUser = props => {
			const userLink = `/pages/${props.user.type}/${
				props.user.type === "twitter" ? props.user.username : props.user.id
			}`
			return (
				<Dimmer.Dimmable
					as={Segment}
					blurring
					className="statusActionSegment"
					dimmed
					raised
				>
					<Dimmer active inverted>
						<div>
							<Header size="tiny">
								Waiting for <Link to={userLink}>{props.user.name}</Link> to offer an
								explanation...
							</Header>
							{props.user.type === "twitter" && (
								<TwitterShareButton
									className="twitterButton ui icon button"
									title={`${props.title}`}
									url={`${window.location.origin}/fallacies/${props.fallacyId}`}
								>
									<Icon name="twitter" /> Tweet @{props.user.username}
								</TwitterShareButton>
							)}
							{props.user.type === "youtube" && (
								<Button
									className="youtubeButton"
									icon
									onClick={() =>
										window.open(
											`https://youtube.com/channel/${props.user.id}`,
											"_blank"
										)
									}
								>
									<Icon name="youtube" /> Contact {props.user.name}
								</Button>
							)}
						</div>
					</Dimmer>
				</Dimmer.Dimmable>
			)
		}
		const ConvoCard = (convo, i) => {
			const isLast = i === convoCount - 1
			return (
				<Card
					color={
						isLast && this.props.status === 2
							? "red"
							: isLast && this.props.status === 3
								? "green"
								: null
					}
					fluid
				>
					<Card.Content>
						<Image
							floated="left"
							size="mini"
							onError={i => (i.target.src = ImagePic)}
							src={convo.img ? convo.img : defaultImg}
						/>
						<Card.Header>
							<Link to={`/users/${convo.username}`}>{convo.name}</Link>
						</Card.Header>
						<Card.Meta>
							<Moment
								date={adjustTimezone(convo.date_created)}
								fromNow
								interval={60000}
							/>
						</Card.Meta>
						<Card.Description
							dangerouslySetInnerHTML={{
								__html: Marked(convo.message)
							}}
						/>
					</Card.Content>
				</Card>
			)
		}
		const RenderPosts = props => {
			if (convoCount > 0 && !props.loading) {
				let convos = []
				for (let i = 0; i < convoCount; i += 2) {
					let round = i === 0 ? 1 : i / 2 + 1
					convos.push(
						<div key={`convo${i}`}>
							<Divider horizontal>Round {round}</Divider>
							<div>
								{ConvoCard(props.conversation[i], i)}
								{i + 1 <= parseInt(convoCount - 1, 10)
									? ConvoCard(props.conversation[i + 1], i + 1)
									: null}
							</div>
						</div>
					)
				}
				return convos
			}
			if (props.loading) {
				return [{}, {}, {}, {}, {}].map((item, i) => (
					<Dimmer.Dimmable as={Segment} dimmed key={`lazyLoad_${i}`}>
						<Dimmer active inverted />
						<Image fluid src={ParagraphPic} />
					</Dimmer.Dimmable>
				))
			}
			return null
		}
		const InitialStatus = props => {
			if (props.source === "fallacy" && props.authenticated) {
				const respondTwitter = props.user
					? user.linkedTwitter && props.tweet && user.twitterId === props.user.id
					: false
				const respondYoutube = props.user
					? user.linkedYoutube && props.video && user.youtubeId === props.user.id
					: false
				if (props.status === 0 && !respondTwitter && !respondYoutube) {
					return <div>{ContactUser(props)}</div>
				}
				if (props.status === 1 && myTurn && (respondTwitter || respondYoutube)) {
					return <div>{RespondForm(props, placeholder)}</div>
				}
			}

			if (props.source === "discussion" && props.authenticated) {
				if (props.status === 0) {
					if (props.createdBy.id !== userId) {
						return (
							<div>
								{RespondForm(
									props,
									`Might you have what it takes to change ${
										props.createdBy.name
									}'s mind?`
								)}
							</div>
						)
					}

					if (props.createdBy.id === userId) {
						return (
							<Segment className="findOpponent">
								<p>
									Find someone who might be able to change your mind.{" "}
									<Popup
										openOnTriggerMouseEnter
										trigger={
											<CopyToClipboard
												onCopy={() => this.setState({ copied: true })}
												text={`${window.location.origin}discussions/${
													props.discussionId
												}`}
											>
												<Icon color="yellow" name="copy" />
											</CopyToClipboard>
										}
									>
										<p>{copied ? "Copied!" : "Copy this link"}</p>
									</Popup>
								</p>
							</Segment>
						)
					}
				}
				if (
					props.status === 1 &&
					(props.acceptedBy.id === userId || props.createdBy.id === userId)
				) {
					const name =
						props.acceptedBy.id === userId
							? props.createdBy.name
							: props.acceptedBy.name
					if (myTurn) {
						return (
							<div>
								{RespondForm(
									props,
									status === 1 ? `It's your move, ${name}.` : placeholder
								)}
							</div>
						)
					} else {
						return (
							<Message
								className="waitMsg"
								content={`Conversations work best when each side listens to what the other has to say. 
                                    Digest what ${name} has to say analyze it piece by piece.`}
								header="Wait your turn"
								icon="chess"
							/>
						)
					}
				}
			}
			return null
		}
		const RespondForm = (props, placeholder = null) => (
			<Form error={props.error} onSubmit={this.submitForm}>
				<TextArea
					className={`convoTextArea ${value}`}
					onChange={this.onChangeMessage}
					placeholder={placeholder}
					rows={6}
					value={message}
				/>
				{props.error && (
					<Message className="convoErrorMsg" content={props.errorMsg} error />
				)}
				<div className="actionSegment">
					<div className="actionOptions">
						I'd like to {ChooseAction(this.props)}.{" "}
						<span className={`extraText ${value}`}>{extraText}</span>
					</div>
					<Button
						className={`convoRespondBtn ${value}`}
						compact
						disabled={disabled}
						icon={icon}
					/>
					<div className="clearfix" />
				</div>
			</Form>
		)

		return (
			<div className="conversation">
				<div className="convoContainer">{RenderPosts(this.props)}</div>
				<div className="convoResponseSection">
					{this.props.createdBy && <div>{InitialStatus(this.props)}</div>}
				</div>
			</div>
		)
	}
}

Conversation.propTypes = {
	acceptedBy: PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		img: PropTypes.string,
		name: PropTypes.string,
		username: PropTypes.string
	}),
	authenticated: PropTypes.bool,
	conversation: PropTypes.array,
	createdBy: PropTypes.shape({
		id: PropTypes.number,
		img: PropTypes.string,
		name: PropTypes.string,
		username: PropTypes.string
	}),
	discussionId: PropTypes.number,
	error: PropTypes.bool,
	errorMsg: PropTypes.string,
	fallacyId: PropTypes.number,
	fetchConversation: PropTypes.func,
	loading: PropTypes.bool,
	source: PropTypes.string,
	status: PropTypes.number,
	submitConversation: PropTypes.func,
	submitted: PropTypes.bool
}

Conversation.defaultProps = {
	conversation: [],
	error: false,
	fetchDiscussionConversation: fetchDiscussionConversation,
	fetchFallacyConversation: fetchFallacyConversation,
	loading: true,
	submitDiscussionConversation: submitDiscussionConversation,
	submitFallacyConversation: submitFallacyConversation,
	submitted: false
}

const mapStateToProps = (state, ownProps) => {
	if (ownProps.source === "fallacy") {
		return {
			...state.fallacy,
			...ownProps
		}
	}
	if (ownProps.source === "discussion") {
		return {
			...state.discussion,
			...ownProps
		}
	}
}

export default connect(
	mapStateToProps,
	{
		fetchDiscussionConversation,
		fetchFallacyConversation,
		submitDiscussionConversation,
		submitFallacyConversation
	}
)(Conversation)
