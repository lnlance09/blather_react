import "pages/css/index.css"
import {
	changeSincerity,
	changeSincerityExplanation,
	changeSummary,
	changeTuring,
	changeTuringExplanation,
	fetchReview,
	saveReview
} from "./actions/target"
import { DisplayMetaTags } from "utils/metaFunctions"
import { connect, Provider } from "react-redux"
import { Link } from "react-router-dom"
import { Button, Container, Divider, Form, Header, Icon, Image, Message } from "semantic-ui-react"
import FallaciesList from "components/fallaciesList/v1/"
import ImagePic from "images/image-square.png"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"
import TrumpImg from "images/trump.svg"

class Target extends Component {
	constructor(props) {
		super(props)
		const userId = this.props.match.params.userId
		const pageId = this.props.match.params.pageId
		const currentState = store.getState()
		const bearer = currentState.user.bearer
		const myId = currentState.user.data.id

		this.state = {
			bearer,
			editing: false,
			loading: false,
			myId,
			pageId,
			userId
		}

		this.props.fetchReview({
			pageId,
			userId
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
		const { editing, loading, myId, userId } = this.state
		const readonly = userId !== myId
		const showMessage = userId === myId && this.props.fallacyCount < 5

		const DisplayFallacies = props => (
			<div className="fallaciesWrapper">
				<Header dividing size="small">
					Fallacies
				</Header>
				<FallaciesList
					assignedBy={userId}
					assignedTo={props.page.id}
					emptyMsgContent={`${props.user.name} hasn't assigned any fallacies to ${
						props.page.name
					}`}
					emptyMsgHeader={false}
					history={props.history}
					network={props.page.network}
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
						Does {props.page.name} sincerely believe most of what he/she talks about?
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
				<div>
					{props.summary
						? props.summary
						: `${props.user.name} has not provided a summary yet`}
				</div>

				<Header as="h2" size="small">
					Does {props.page.name} sincerely believe most of what he/she talks about?
					<Header.Subheader>{props.sincerity ? "Yes" : "No"}</Header.Subheader>
				</Header>
				<div>
					{props.sincerityExplanation
						? props.sincerityExplanation
						: `${props.user.name} has not answered yet`}
				</div>

				<Header as="h2" size="small">
					Can {props.page.name} pass an{" "}
					<a
						href="https://www.econlib.org/archives/2011/06/the_ideological.html"
						target="_blank"
						rel="noopener noreferrer"
					>
						Ideological Turing Test
					</a>
					?<Header.Subheader>{props.turingTest ? "Yes" : "No"}</Header.Subheader>
				</Header>
				<div>
					{props.turingTestExplanation
						? props.turingTestExplanation
						: `${props.user.name} has not answered yet`}
				</div>
			</div>
		)

		return (
			<Provider store={store}>
				<div className="targetsPage">
					<DisplayMetaTags page="target" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					<Container className="mainContainer" text textAlign="left">
						{this.props.error ? (
							<Container className="mainContainer" text textAlign="center">
								<Image centered disabled size="medium" src={TrumpImg} />
								<Header size="medium">This target does not exist</Header>
							</Container>
						) : (
							<div>
								<Image
									centered
									circular
									className="targetImg"
									onClick={() => this.props.history.push(this.props.page.link)}
									onError={i => (i.target.src = ImagePic)}
									size="small"
									src={this.props.page.pic}
								/>
								<Header as="h1" size="medium" textAlign="center">
									{this.props.page.name}
									<Header.Subheader>
										Review by{" "}
										<Link to={`/users/${this.props.user.id}`}>
											{this.props.user.name}
										</Link>
									</Header.Subheader>
								</Header>
								<Divider />
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
									<div>
										{ShowAnswers(this.props)}
										<Divider />
									</div>
								)}
								{this.props.page.id && <div>{DisplayFallacies(this.props)}</div>}
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
	hasSubmitted: PropTypes.bool,
	fallacyCount: PropTypes.number,
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
	changeSincerity: changeSincerity,
	changeSincerityExplanation: changeSincerityExplanation,
	changeSummary: changeSummary,
	changeTuringExplanation: changeTuringExplanation,
	fetchReview: fetchReview,
	hasSubmitted: false,
	page: {},
	sincerityExplanation: "",
	summary: "",
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
		fetchReview,
		saveReview
	}
)(Target)
