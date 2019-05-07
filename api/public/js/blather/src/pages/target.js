import "pages/css/index.css"
import {
	changeSincerity,
	changeSincerityExplanation,
	changeSummary,
	changeTuring,
	changeTuringExplanation,
	fetchPage,
	fetchReview,
	saveReview
} from "./actions/target"
import { DisplayMetaTags } from "utils/metaFunctions"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import {
	Button,
	Container,
	Form,
	Header,
	Icon,
	Image,
	Message,
	Placeholder
} from "semantic-ui-react"
import FallaciesList from "components/fallaciesList/v1/"
import ImagePic from "images/image-square.png"
import LazyLoad from "components/lazyLoad/v1/"
import Marked from "marked"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"
import TrumpImg from "images/trump-white.png"

class Target extends Component {
	constructor(props) {
		super(props)
		const userId = this.props.match.params.userId
		const exists = !isNaN(parseInt(userId, 10))
		const pageId = this.props.match.params.pageId
		const currentState = store.getState()
		const bearer = currentState.user.bearer
		const auth = currentState.user.authenticated
		const myId = currentState.user.data.id

		this.state = {
			auth,
			bearer,
			editing: false,
			exists,
			loading: false,
			myId,
			pageId,
			userId
		}

		if (exists) {
			this.props.fetchReview({
				pageId,
				userId
			})
		} else {
			this.props.fetchPage(pageId)
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

		this.changeSincerityExplanation = this.changeSincerityExplanation.bind(this)
		this.changeSummary = this.changeSummary.bind(this)
		this.changeTuringExplanation = this.changeTuringExplanation.bind(this)
		this.handleSincerityChange = this.handleSincerityChange.bind(this)
		this.handleTuringChange = this.handleTuringChange.bind(this)
		this.submitForm = this.submitForm.bind(this)
	}

	changeSincerityExplanation = (e, { value }) => this.props.changeSincerityExplanation({ value })
	changeSummary = (e, { value }) => this.props.changeSummary({ value })
	changeTuringExplanation = (e, { value }) => this.props.changeTuringExplanation({ value })
	handleSincerityChange = (e, { value }) => this.props.changeSincerity({ value })
	handleTuringChange = (e, { value }) => this.props.changeTuring({ value })
	submitForm = () => {
		this.setState({ editing: false, loading: true })
		this.props.saveReview({
			bearer: this.state.bearer,
			id: this.props.id,
			sincerity: this.props.sincerity,
			sincerityExplanation: this.props.sincerityExplanation,
			summary: this.props.summary,
			turingTest: this.props.turingTest,
			turingTestExplanation: this.props.turingTestExplanation
		})
	}

	render() {
		const { auth, editing, exists, loading, myId, userId } = this.state
		const { error, page, user } = this.props
		const readonly = userId !== myId
		const showMessage = (userId === myId && this.props.fallacyCount < 5) || !exists
		const DisplayFallacies = ({ props }) => (
			<div className="fallaciesWrapper">
				<Header dividing size="medium">
					Fallacies
				</Header>
				<FallaciesList
					assignedBy={userId}
					assignedTo={props.page.id}
					emptyMsgContent={`${props.user.name} hasn't assigned any fallacies to ${
						props.page.name
					}`}
					history={props.history}
					icon="sticky note"
					network={props.page.network}
					showPics={false}
					source="targets"
				/>
			</div>
		)
		const Questionnaire = props => (
			<Form className="questionnaire" onSubmit={this.submitForm}>
				<Form.TextArea
					autoHeight
					disabled={props.fallacyCount < 5}
					label="Summary"
					onChange={this.changeSummary}
					readOnly={readonly}
					rows={5}
					value={props.summary}
				/>
				<Form.Field disabled={props.fallacyCount < 5}>
					<label>
						Does {props.page.name} sincerely believe most of what they talks about?
					</label>
				</Form.Field>
				<Form.Group inline>
					<Form.Radio
						checked={props.sincerity === true}
						disabled={props.fallacyCount < 5}
						label="Yes"
						name="sincerity"
						onChange={this.handleSincerityChange}
						readOnly={readonly}
						value="yes"
					/>
					<Form.Radio
						checked={props.sincerity === false}
						disabled={props.fallacyCount < 5}
						label="No"
						name="sincerity"
						onChange={this.handleSincerityChange}
						readOnly={readonly}
						value="no"
					/>
				</Form.Group>
				<Form.TextArea
					autoHeight
					disabled={props.fallacyCount < 5}
					onChange={this.changeSincerityExplanation}
					readOnly={readonly}
					rows={5}
					value={props.sincerityExplanation}
				/>
				<Form.Field disabled={props.fallacyCount < 5}>
					<label>
						Can {props.page.name} pass an{" "}
						<a
							href="https://www.econlib.org/archives/2011/06/the_ideological.html"
							target="_blank"
							rel="noopener noreferrer"
						>
							Ideological Turing Test
						</a>
						?
					</label>
				</Form.Field>
				<Form.Group inline>
					<Form.Radio
						checked={props.turingTest === true}
						disabled={props.fallacyCount < 5}
						label="Yes"
						name="turingTest"
						onChange={this.handleTuringChange}
						readOnly={readonly}
						value="yes"
					/>
					<Form.Radio
						checked={props.turingTest === false}
						disabled={props.fallacyCount < 5}
						label="No"
						name="turingTest"
						onChange={this.handleTuringChange}
						readOnly={readonly}
						value="no"
					/>
				</Form.Group>
				<Form.TextArea
					autoHeight
					disabled={props.fallacyCount < 5}
					onChange={this.changeTuringExplanation}
					readOnly={readonly}
					rows={5}
					value={props.turingTestExplanation}
				/>
				<Button
					color="blue"
					content="Update"
					fluid
					loading={loading && !props.hasSubmitted}
					type="submit"
				/>
			</Form>
		)
		const ShowAnswers = props => (
			<div>
				{props.hasLoaded ? (
					<div className="answers">
						<Header as="h2" className="summaryHeader" size="small">
							Summary
							{userId === myId && (
								<Icon
									name="pencil"
									onClick={() => this.setState({ editing: true })}
									size="tiny"
								/>
							)}
						</Header>
						{exists ? (
							<div
								className="answerField"
								dangerouslySetInnerHTML={{
									__html: props.summary
										? Marked(props.summary)
										: `${props.user.name} has not provided a summary yet`
								}}
							/>
						) : (
							<div>
								<LazyLoad header={false} segment={false} />
								<LazyLoad header={false} segment={false} />
							</div>
						)}

						<Header as="h2" size="small">
							Does {props.page.name} sincerely believe most of what they talks about?
							{props.sincerity !== null && (
								<Header.Subheader>
									{props.sincerity ? "Yes" : "No"}
								</Header.Subheader>
							)}
						</Header>
						{exists ? (
							<div
								className="answerField"
								dangerouslySetInnerHTML={{
									__html: props.sincerityExplanation
										? Marked(props.sincerityExplanation)
										: `${props.user.name} has not answered yet`
								}}
							/>
						) : (
							<LazyLoad header={false} segment={false} />
						)}

						<Header as="h2" size="small">
							Can {props.page.name} pass an{" "}
							<a
								href="https://www.econlib.org/archives/2011/06/the_ideological.html"
								target="_blank"
								rel="noopener noreferrer"
							>
								Ideological Turing Test
							</a>
							?
							{props.turingTest !== null && (
								<Header.Subheader>
									{props.turingTest ? "Yes" : "No"}
								</Header.Subheader>
							)}
						</Header>
						{exists ? (
							<div
								className="answerField"
								dangerouslySetInnerHTML={{
									__html: props.turingTestExplanation
										? Marked(props.turingTestExplanation)
										: `${props.user.name} has not answered yet`
								}}
							/>
						) : (
							<LazyLoad header={false} segment={false} />
						)}
					</div>
				) : (
					<LazyLoad header={false} />
				)}
			</div>
		)

		return (
			<Provider store={store}>
				<div className="targetsPage">
					<DisplayMetaTags page="target" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					<Container className="mainContainer" text textAlign="left">
						{error ? (
							<Container className="mainContainer" text textAlign="center">
								<Image
									centered
									className="trumpImg404"
									size="medium"
									src={TrumpImg}
								/>
								<Header size="medium">This target does not exist</Header>
							</Container>
						) : (
							<div>
								{page.pic ? (
									<Image
										bordered
										centered
										circular
										className="targetImg"
										onClick={() => this.props.history.push(page.link)}
										onError={i => (i.target.src = ImagePic)}
										size="small"
										src={page.pic}
									/>
								) : (
									<Container textAlign="center">
										<Placeholder className="profilePicPlaceholder">
											<Placeholder.Image square />
										</Placeholder>
									</Container>
								)}

								<Header as="h1" size="medium" textAlign="center">
									{page.name}
									<Header.Subheader>
										Review by{" "}
										{auth ? (
											<Link to={`/users/${user.id}`}>{user.name}</Link>
										) : (
											<Link to={`/signin`}>You</Link>
										)}
									</Header.Subheader>
								</Header>
								{showMessage && (
									<Message
										content={`You must assign at least 5 fallacies to ${
											this.props.page.name
										} before you can submit a review`}
										warning
									/>
								)}
								{editing ? (
									<div>{Questionnaire(this.props)}</div>
								) : (
									<div>{ShowAnswers(this.props)}</div>
								)}
								{page.id && (
									<div>
										<DisplayFallacies props={this.props} />
									</div>
								)}
							</div>
						)}
					</Container>
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

Target.propTypes = {
	changeSincerity: PropTypes.func,
	changeSincerityExplanation: PropTypes.func,
	changeSummary: PropTypes.func,
	changeTuringExplanation: PropTypes.func,
	error: PropTypes.bool,
	hasLoaded: PropTypes.bool,
	hasSubmitted: PropTypes.bool,
	fallacyCount: PropTypes.number,
	fetchPage: PropTypes.func,
	fetchReview: PropTypes.func,
	id: PropTypes.number,
	page: PropTypes.shape({
		id: PropTypes.string,
		link: PropTypes.string,
		name: PropTypes.string,
		pic: PropTypes.string,
		username: PropTypes.string
	}),
	sincerity: PropTypes.bool,
	sincerityExplanation: PropTypes.string,
	summary: PropTypes.string,
	turingTest: PropTypes.bool,
	turingTestExplanation: PropTypes.string,
	user: PropTypes.shape({
		id: PropTypes.string,
		name: PropTypes.string
	})
}

Target.defaultProps = {
	changeSincerity,
	changeSincerityExplanation,
	changeSummary,
	changeTuringExplanation,
	fetchReview,
	hasLoaded: false,
	hasSubmitted: false,
	fetchPage,
	page: {},
	sincerity: null,
	sincerityExplanation: "",
	summary: "",
	turingTest: null,
	turingTestExplanation: "",
	user: {}
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.target,
		...state.user,
		...ownProps
	}
}

export default connect(
	mapStateToProps,
	{
		changeSincerity,
		changeSincerityExplanation,
		changeSummary,
		changeTuring,
		changeTuringExplanation,
		fetchPage,
		fetchReview,
		saveReview
	}
)(Target)
