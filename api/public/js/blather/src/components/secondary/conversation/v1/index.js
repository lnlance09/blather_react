import "./style.css"
import { fetchFallacyConversation, submitFallacyConversation } from "pages/actions/fallacy"
import {
	acceptDiscussionConvo,
	fetchDiscussionConversation,
	submitDiscussionConversation
} from "pages/actions/discussion"
import { CopyToClipboard } from "react-copy-to-clipboard"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import {
	Button,
	Container,
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
import ImagePic from "images/images/image-square.png"
import LazyLoad from "components/lazyLoad/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"

class Conversation extends Component {
	constructor(props) {
		super(props)

		const currentState = store.getState()
		const user = currentState.user

		this.state = {
			acceptance: "",
			copied: false,
			disabled: false,
			extraText: "",
			icon: "paper plane",
			msg: "",
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
	}

	acceptConvo = () => {
		const { acceptance } = this.state
		if (acceptance) {
			this.props.acceptDiscussionConvo({
				acceptance,
				bearer: this.props.bearer,
				id: this.props.discussionId
			})
		}
	}

	onChangeAcceptance = (e, { value }) => this.setState({ acceptance: value })

	onChangeMessage = (e, { value }) => this.setState({ disabled: value === "", msg: value })

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
				placeholder = `Why wasn't this conversation with ${this.props.createdBy.name} productive?`
				break
			case 3:
				extraText = "I've heard enough to be convinced."
				placeholder = `What was it that ${this.props.createdBy.name} said that changed your mind?`
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

	submitForm = () => {
		const { msg, status } = this.state

		if (msg !== "") {
			if (this.props.source === "fallacy") {
				this.props.submitFallacyConversation({
					bearer: this.props.bearer,
					id: this.props.fallacyId,
					msg,
					status
				})
			}
			if (this.props.source === "discussion") {
				this.props.submitDiscussionConversation({
					bearer: this.props.bearer,
					id: this.props.discussionId,
					msg,
					status
				})
			}

			this.setState({ msg: "" })
		}
	}

	render() {
		const {
			acceptance,
			copied,
			disabled,
			extraText,
			icon,
			msg,
			placeholder,
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

		const AcceptForm = props => (
			<Form error={props.error} onSubmit={this.acceptConvo}>
				<Form.Field
					autoHeight
					control={TextArea}
					label={`Before you can participate in this discussion, you must provide the most charitable explanation of ${props.createdBy.name}'s argument first.`}
					onChange={this.onChangeAcceptance}
					placeholder={`What is the ${props.createdBy.name}'s argument?`}
					rows={6}
					value={acceptance}
				/>
				{props.error && (
					<Message className="convoErrorMsg" content={props.errorMsg} error />
				)}
				<div className="actionSegment">
					<Button
						className="acceptBtn"
						color="green"
						disabled={disabled}
						icon
						labelPosition="left"
					>
						<Icon name="check" />
						{`I understand ${props.createdBy.name}'s argument`}
					</Button>
				</div>
			</Form>
		)

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

		const ConvoCard = (convo, i) => {
			const isLast = i === convoCount - 1
			return (
				<Segment
					className="convoSegment"
					color={
						isLast && this.props.status === 2
							? "red"
							: isLast && this.props.status === 3
							? "green"
							: null
					}
					fluid
				>
					<Header as="p" className="convoHeader">
						<Image
							circular
							floated="left"
							onError={i => (i.target.src = ImagePic)}
							size="small"
							src={convo.img ? convo.img : defaultImg}
						/>
						<Link to={`/users/${convo.username}`}>{convo.name}</Link>
						<Header.Subheader>
							<Moment
								date={adjustTimezone(convo.date_created)}
								fromNow
								interval={60000}
							/>
						</Header.Subheader>
					</Header>
					<Container>
						<p
							dangerouslySetInnerHTML={{
								__html: Marked(convo.message)
							}}
						/>
					</Container>
				</Segment>
			)
		}

		const InitialStatus = props => {
			if (props.source === "fallacy" && props.authenticated) {
				const respondTwitter = props.user
					? user.linkedTwitter && props.tweet && user.twitterId === props.user.id
					: false
				const respondYoutube = props.user
					? user.linkedYoutube && props.video && user.youtubeId === props.user.id
					: false
				if (props.status === 1 && myTurn && (respondTwitter || respondYoutube)) {
					return <div>{RespondForm(props, placeholder)}</div>
				}
			}

			if (props.source === "discussion" && props.authenticated) {
				if (props.status === 0) {
					if (props.createdBy.id !== userId) {
						return <div>{AcceptForm(props)}</div>
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
												text={`${window.location.origin}discussions/${props.discussionId}`}
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
						return <div>{RespondForm(props, `It's your move, ${user.name}.`)}</div>
					} else {
						return (
							<Message
								className="waitMsg"
								content={`Take this conversation one point at a time and see how ${name} responds before saying anything else.`}
								header="Wait your turn"
								icon="chess"
							/>
						)
					}
				}
			}
			return null
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
				return [{}, {}, {}, {}, {}].map((item, i) => <LazyLoad header={false} />)
			}
			return null
		}

		const RespondForm = (props, placeholder = null) => (
			<Form error={props.error} onSubmit={this.submitForm}>
				<Form.Field
					autoHeight
					className={`convoTextArea ${value}`}
					control={TextArea}
					onChange={this.onChangeMessage}
					placeholder={placeholder}
					rows={6}
					value={msg}
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
				{this.props.status > 0 && (
					<div>
						<Header as="h4" className="interpretationHeader">
							Steel Man
							<Header.Subheader>
								This is {this.props.acceptedBy.name}
								's most charitable understanding of your argument
							</Header.Subheader>
						</Header>
						<Container>{this.props.acceptance}</Container>
						<Divider horizontal />
					</div>
				)}
				<div className="convoContainer">{RenderPosts(this.props)}</div>
				<div className="convoResponseSection">
					{this.props.createdBy && <div>{InitialStatus(this.props)}</div>}
				</div>
			</div>
		)
	}
}

Conversation.propTypes = {
	acceptance: PropTypes.string,
	acceptDiscussionConvo: PropTypes.func,
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
	acceptance: "",
	acceptDiscussionConvo,
	conversation: [],
	error: false,
	fetchDiscussionConversation,
	fetchFallacyConversation,
	loading: true,
	submitDiscussionConversation,
	submitFallacyConversation,
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

export default connect(mapStateToProps, {
	acceptDiscussionConvo,
	fetchDiscussionConversation,
	fetchFallacyConversation,
	submitDiscussionConversation,
	submitFallacyConversation
})(Conversation)
