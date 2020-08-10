import {
	changeSincerity,
	changeSincerityExplanation,
	changeSummary,
	changeTuring,
	changeTuringExplanation,
	fetchPage,
	fetchReview,
	saveReview
} from "redux/actions/target"
import { DisplayMetaTags } from "utils/metaFunctions"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import {
	Button,
	Container,
	Divider,
	Form,
	Header,
	Icon,
	Image,
	Message,
	Placeholder
} from "semantic-ui-react"
import defaultImg from "images/avatar/large/steve.jpg"
import DefaultLayout from "layouts"
import FallaciesList from "components/secondary/lists/fallaciesList/v1/"
import ImagePic from "images/images/image-square.png"
import LazyLoad from "components/primary/lazyLoad/v1/"
import Marked from "marked"
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
		const { editing, exists, loading, myId, userId } = this.state
		const { error, page, user } = this.props

		const disabled = this.props.fallacyCount < 5
		const readonly = userId !== myId
		const showMessage = (userId === myId && disabled) || !exists

		const DisplayFallacies = ({ props }) => (
			<div className="fallaciesWrapper">
				<Divider hidden />
				<Header inverted size="large">
					{props.user.name}'s criticisms
				</Header>
				<FallaciesList
					assignedBy={userId}
					assignedTo={props.page.id}
					emptyMsgContent={`${props.user.name} hasn't assigned any fallacies to ${props.page.name}`}
					history={props.history}
					icon="warning sign"
					itemsPerRow={2}
					network={props.page.network}
					showPics={false}
					size="large"
					source="targets"
				/>
			</div>
		)

		const Questionnaire = props => (
			<Form className="questionnaire" inverted onSubmit={this.submitForm}>
				<Form.Field disabled={disabled}>
					<Header inverted size="medium">
						Summary
					</Header>
					<Form.TextArea
						autoHeight
						onChange={this.changeSummary}
						readOnly={readonly}
						rows={5}
						value={props.summary}
					/>
				</Form.Field>
				<Form.Field disabled={disabled}>
					<Header inverted size="medium">
						Does {props.page.name} sincerely believe most of what they talk about?
					</Header>
				</Form.Field>
				<Form.Group inline>
					<Form.Radio
						checked={props.sincerity === true}
						disabled={disabled}
						label="Yes"
						name="sincerity"
						onChange={this.handleSincerityChange}
						readOnly={readonly}
						value="yes"
					/>
					<Form.Radio
						checked={props.sincerity === false}
						disabled={disabled}
						label="No"
						name="sincerity"
						onChange={this.handleSincerityChange}
						readOnly={readonly}
						value="no"
					/>
				</Form.Group>
				<Form.TextArea
					autoHeight
					disabled={disabled}
					onChange={this.changeSincerityExplanation}
					readOnly={readonly}
					rows={5}
					value={props.sincerityExplanation}
				/>
				<Form.Field disabled={disabled}>
					<Header inverted size="medium">
						Can {props.page.name} pass an{" "}
						<a
							href="https://www.econlib.org/archives/2011/06/the_ideological.html"
							target="_blank"
							rel="noopener noreferrer"
						>
							Ideological Turing Test
						</a>
						?
					</Header>
				</Form.Field>
				<Form.Group inline>
					<Form.Radio
						checked={props.turingTest === true}
						disabled={disabled}
						label="Yes"
						name="turingTest"
						onChange={this.handleTuringChange}
						readOnly={readonly}
						value="yes"
					/>
					<Form.Radio
						checked={props.turingTest === false}
						disabled={disabled}
						label="No"
						name="turingTest"
						onChange={this.handleTuringChange}
						readOnly={readonly}
						value="no"
					/>
				</Form.Group>
				<Form.TextArea
					autoHeight
					disabled={disabled}
					onChange={this.changeTuringExplanation}
					readOnly={readonly}
					rows={5}
					value={props.turingTestExplanation}
				/>
				<Button
					color="blue"
					content="Update"
					disabled={disabled}
					fluid
					loading={loading && !props.hasSubmitted}
					size="big"
					type="submit"
				/>
			</Form>
		)

		const ShowAnswers = props => (
			<div>
				{props.hasLoaded ? (
					<div className="answers">
						<Header as="h2" className="summaryHeader" inverted size="medium">
							Summary
							{userId === myId && !disabled ? (
								<Icon
									name="pencil"
									onClick={() => this.setState({ editing: true })}
									size="tiny"
								/>
							) : null}
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
								<LazyLoad header={false} />
							</div>
						)}

						<Header as="h2" inverted size="medium">
							Does {props.page.name} sincerely believe most of what they talk about?
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
							<LazyLoad header={false} />
						)}

						<Header as="h2" inverted size="medium">
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
							<LazyLoad header={false} />
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

					<DefaultLayout
						activeItem=""
						containerClassName="targetsPage"
						history={this.props.history}
					>
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
									<Container className="imgContainer" text textAlign="center">
										<div className="targetImgDiv">
											<Image
												bordered
												centered
												circular
												className="targetImg"
												inline
												onClick={() => this.props.history.push(page.link)}
												onError={i => (i.target.src = ImagePic)}
												size="small"
												src={page.pic}
											/>
											<Image
												bordered
												centered
												circular
												className="targetImg user"
												inline
												onClick={() => {
													if (user.username) {
														this.props.history.push(
															`/users/${user.username}`
														)
													}
												}}
												onError={i => (i.target.src = defaultImg)}
												size="small"
												src={user.img ? user.img : defaultImg}
											/>
										</div>
									</Container>
								) : (
									<Container textAlign="center">
										<Placeholder className="profilePicPlaceholder">
											<Placeholder.Image square />
										</Placeholder>
									</Container>
								)}

								<Header as="h1" inverted size="large" textAlign="center">
									{page.name}
									<Header.Subheader>
										Review by{" "}
										{user.id ? (
											<Link to={`/users/${user.id}`}>{user.name}</Link>
										) : (
											<Link to={`/signin`}>You</Link>
										)}
									</Header.Subheader>
								</Header>
								<Divider hidden />

								{showMessage && (
									<Message
										content={`You must assign at least 5 fallacies to ${this.props.page.name} before you can submit a review`}
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
					</DefaultLayout>
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
		img: PropTypes.string,
		name: PropTypes.string,
		username: PropTypes.string
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

export default connect(mapStateToProps, {
	changeSincerity,
	changeSincerityExplanation,
	changeSummary,
	changeTuring,
	changeTuringExplanation,
	fetchPage,
	fetchReview,
	saveReview
})(Target)
