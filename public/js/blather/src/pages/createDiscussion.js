import "./css/index.css"
import { DisplayMetaTags } from "utils/metaFunctions"
import { setTags, submitDiscussion } from "pages/actions/discussion"
import { Provider, connect } from "react-redux"
import { Redirect } from "react-router-dom"
import {
	Button,
	Container,
	Dimmer,
	Divider,
	Dropdown,
	Form,
	Grid,
	Header,
	Icon,
	List,
	Segment,
	TextArea,
	Transition
} from "semantic-ui-react"
import Marked from "marked"
import PageFooter from "components/footer/v1/"
import PageHeader from "components/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"

class CreateDiscussionPage extends Component {
	constructor(props) {
		super(props)
		const currentState = store.getState()
		const bearer = currentState.user.bearer
		const authenticated = currentState.user.authenticated
		this.state = {
			authenticated,
			bearer,
			description: "",
			duration: 500,
			error: false,
			extra: "",
			hasSubmitted: false,
			loading: false,
			options: [],
			preview: false,
			title: "",
			tags: [],
			values: [],
			visible: true,
			user: currentState.user
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

		this.onChangeDescription = this.onChangeDescription.bind(this)
		this.onChangeExtra = this.onChangeExtra.bind(this)
		this.onChangeTitle = this.onChangeTitle.bind(this)
		this.submitDiscussion = this.submitDiscussion.bind(this)
		this.handleAddition = this.handleAddition.bind(this)
		this.handleChange = this.handleChange.bind(this)
		this.togglePreview = this.togglePreview.bind(this)
	}

	componentDidMount() {
		this.fetchTags()
	}

	fetchTags() {
		return fetch(`${window.location.origin}/api/tags/getTags`, {
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then(response => {
				if (response.ok) {
					response.json().then(data => {
						this.setState({ options: data.tags })
					})
				}
			})
			.catch(err => console.log(err))
	}

	handleAddition = (e, { value }) =>
		this.setState({
			options: [{ text: value, value }, ...this.state.options]
		})
	handleChange = (e, { value }) => this.setState({ tags: value })
	onChangeDescription = (e, { value }) => this.setState({ description: value })
	onChangeExtra = (e, { value }) => this.setState({ extra: value })
	onChangeTitle = (e, { value }) => this.setState({ title: value })

	submitDiscussion(e) {
		this.props.submitDiscussion({
			bearer: this.state.bearer,
			description: this.state.description,
			extra: this.state.extra,
			tags: this.state.tags,
			title: this.state.title
		})
		this.setState({
			loading: true,
			hasSubmitted: true
		})
	}

	togglePreview = () => {
		this.setState({
			preview: this.state.preview ? false : true,
			visible: this.state.visible ? false : true
		})
	}

	render() {
		const {
			authenticated,
			description,
			duration,
			extra,
			hasSubmitted,
			loading,
			options,
			preview,
			tags,
			title,
			visible
		} = this.state
		const hasUpdated =
			authenticated && (title !== "" || description !== "" || extra !== "") ? true : false
		const DiscussionForm = props => {
			return (
				<Transition animation="fade" duration={duration} visible={visible}>
					<Dimmer.Dimmable as={Segment} dimmed={authenticated ? false : true}>
						<Form loading={loading && !props.error} onSubmit={this.submitDiscussion}>
							<Form.Input
								className="titleInput"
								error={props.errorType === 101 && title === ""}
								fluid
								label="What is your claim?"
								maxLength={250}
								onChange={this.onChangeTitle}
								placeholder="Please be concise"
								value={title}
							/>
							<Form.Field
								className="evidenceEditor"
								control={TextArea}
								error={props.errorType === 103}
								label="Why do you beleive this to be true?"
								onChange={this.onChangeDescription}
								placeholder="What is your evidence? Try to use reputable sources."
								rows={15}
								value={description}
							/>
							<Form.Field
								className="provenWrongTextArea"
								control={TextArea}
								error={props.errorType === 104}
								label="What would it take for you to be proven wrong?"
								onChange={this.onChangeExtra}
								placeholder="If the answer is nothing then don't bother posting."
								rows={12}
								value={extra}
							/>
							<Dropdown
								allowAdditions
								closeOnChange
								fluid
								multiple
								onAddItem={this.handleAddition}
								onChange={this.handleChange}
								options={options}
								placeholder="Tags"
								search
								selection
								value={tags}
							/>
							{hasUpdated && (
								<div>
									<Button
										animated="vertical"
										as="a"
										className="previewDiscussionButton"
										content="Preview"
										fluid
										onClick={this.togglePreview}>
										<Button.Content visible>Preview</Button.Content>
										<Button.Content hidden>
											<Icon name="eye" />
										</Button.Content>
									</Button>
									<Divider horizontal>Or</Divider>
								</div>
							)}
							<Button className="submitDiscussionButton" fluid type="submit">
								<Button.Content visible>Start the dicussion</Button.Content>
							</Button>
						</Form>
						<Dimmer active={authenticated ? false : true}>
							<Header as="h2">Sign in to start a discussion</Header>
							<Button
								content="Sign in"
								onClick={e => props.history.push("/signin")}
							/>
						</Dimmer>
					</Dimmer.Dimmable>
				</Transition>
			)
		}
		const HeaderTitle = <Header as="h1">Start a Discussion</Header>
		const Preview = () => {
			return (
				<Transition animation="fade" duration={duration} visible={preview}>
					<Segment className="previewSegment">
						<Header size="large">{title}</Header>
						<div>
							<Header className="descriptionTitle" size="medium">
								Evidence
							</Header>
							<div
								className="descriptionPreview"
								dangerouslySetInnerHTML={{
									__html: Marked(description)
								}}
							/>
						</div>
						<div style={{ marginTop: "15px" }}>
							<Header className="extraTitle" size="medium">
								What it takes to change my mind
							</Header>
							<div
								className="extraPreview"
								dangerouslySetInnerHTML={{
									__html: Marked(extra)
								}}
							/>
						</div>
						<Button
							animated
							className="exitPreviewButton"
							fluid
							onClick={this.togglePreview}>
							<Button.Content hidden>Exit preview</Button.Content>
							<Button.Content visible>
								<Icon name="close" />
							</Button.Content>
						</Button>
					</Segment>
				</Transition>
			)
		}

		return this.props.hasSubmitted && hasSubmitted ? (
			<Redirect to={`/discussions/${this.props.id}`} />
		) : (
			<Provider store={store}>
				<div className="createDiscussionPage">
					<DisplayMetaTags
						page="createDiscussion"
						props={this.props}
						state={this.state}
					/>
					<PageHeader {...this.props} />
					<Container className="mainContainer" textAlign="left">
						{HeaderTitle}
						<Grid>
							<Grid.Column className="leftSide" width={12}>
								<Container className="contentContainer">
									{DiscussionForm(this.props)}
									{Preview()}
								</Container>
							</Grid.Column>

							<Grid.Column className="rightSide" width={4}>
								<Header as="h2" className="discussionTagsHeader">
									Tips
								</Header>
								<List relaxed>
									<List.Item>Try not to employ any logical fallacies</List.Item>
									<List.Item>
										Always entertain the possibility that you could be wrong
									</List.Item>
									<List.Item>
										Why be wrong about something for a second longer than you
										have to?
									</List.Item>
									<List.Item>
										Recognize that your entire sense of identity shouldn't be
										wrapped up in your beliefs
									</List.Item>
								</List>
							</Grid.Column>
						</Grid>
					</Container>
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

CreateDiscussionPage.propTypes = {
	error: PropTypes.bool,
	errorMsg: PropTypes.string,
	errorType: PropTypes.number,
	hasSubmitted: PropTypes.bool,
	id: PropTypes.number,
	options: PropTypes.array,
	setTags: PropTypes.func,
	submitDiscussion: PropTypes.func,
	tags: PropTypes.array
}

CreateDiscussionPage.defaultProps = {
	discussion: {},
	error: false,
	options: [],
	setTags: setTags,
	submitDiscussion: submitDiscussion,
	tags: []
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.discussion,
		...ownProps
	}
}

export default connect(
	mapStateToProps,
	{
		setTags,
		submitDiscussion
	}
)(CreateDiscussionPage)
