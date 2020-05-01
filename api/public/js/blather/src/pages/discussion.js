import { mapIdsToNames } from "utils/arrayFunctions"
import { adjustTimezone } from "utils/dateFunctions"
import { DisplayMetaTags } from "utils/metaFunctions"
import { sanitizeText } from "utils/textFunctions"
import {
	fetchDiscussion,
	updateDescription,
	updateDiscussion,
	updateExtra
} from "redux/actions/discussion"
import { Provider, connect } from "react-redux"
import { Link } from "react-router-dom"
import {
	Button,
	Container,
	Divider,
	Form,
	Grid,
	Header,
	Icon,
	Image,
	Responsive,
	TextArea
} from "semantic-ui-react"
import Marked from "marked"
import Moment from "react-moment"
import Conversation from "components/secondary/conversation/v1/"
import PageFooter from "components/primary/footer/v1/"
import PageHeader from "components/secondary/header/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import store from "store"
import TagsCard from "components/primary/tagsCard/v1/"
import TitleHeader from "components/primary/titleHeader/v1/"
import TrumpImg from "images/trump-white.png"

class DiscussionPage extends Component {
	constructor(props) {
		super(props)
		const id = parseInt(this.props.match.params.id, 10)
		const currentState = store.getState()
		const user = currentState.user
		const bearer = user.bearer
		const authenticated = user.authenticated

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

		this.state = {
			authenticated,
			bearer,
			editingDescription: false,
			editingExtra: false,
			id,
			user
		}
	}

	componentDidMount() {
		if (this.props.id === undefined) {
			this.props.fetchDiscussion({
				bearer: this.state.bearer,
				id: this.state.id
			})
		}
	}

	onClickEditDescription = () => {
		this.setState({
			editingDescription: this.state.editingDescription === false
		})
	}

	onClickEditExtra = () => {
		this.setState({ editingExtra: this.state.editingExtra === false })
	}

	updateDescription = (e, { value }) => {
		this.props.updateDescription({ description: value })
	}

	updateDiscussion = () => {
		if (this.props.description && this.props.extra !== "") {
			this.props.updateDiscussion({
				bearer: this.state.bearer,
				description: this.props.description,
				extra: this.props.extra,
				id: this.props.id
			})
			this.setState({ editingDescription: false, editingExtra: false })
		}
	}

	updateExtra = (e, { value }) => {
		this.props.updateExtra({ extra: value })
	}

	render() {
		const { authenticated, bearer, editingDescription, editingExtra, id, user } = this.state
		const createdAt = adjustTimezone(this.props.dateCreated)
		const isMine = this.props.createdBy
			? parseInt(user.data.id, 10) === this.props.createdBy.id
			: false
		const EditButton = ({ props, type }) => {
			if (isMine) {
				if (type === "description") {
					if (props.description) {
						return (
							<Icon
								className={`editButton ${editingDescription ? "editing" : ""}`}
								name={editingDescription ? "close" : "pencil"}
								onClick={this.onClickEditDescription}
							/>
						)
					}
				}
				if (type === "extra") {
					if (props.extra) {
						return (
							<Icon
								className={`editButton ${editingExtra ? "editing" : ""}`}
								name={editingExtra ? "close" : "pencil"}
								onClick={this.onClickEditExtra}
							/>
						)
					}
				}
			}
			return null
		}
		const EvidenceSection = props => {
			return (
				<div>
					{props.description && (
						<Header as="h2" size="medium">
							Evidence
							<EditButton props={props} type="description" />
						</Header>
					)}
					{editingDescription ? (
						<Form onSubmit={this.updateDiscussion}>
							<Form.Field>
								<TextArea
									autoHeight
									onChange={this.updateDescription}
									placeholder="What is your evidence? Try to use reputable sources."
									rows={15}
									value={props.description}
								/>
							</Form.Field>
							<Button
								className="updateDiscussionBtn"
								color="blue"
								content="Update"
								fluid
								type="submit"
							/>
						</Form>
					) : (
						<div>
							{props.description && (
								<div
									dangerouslySetInnerHTML={{
										__html: sanitizeText(Marked(props.description))
									}}
								/>
							)}
						</div>
					)}
					{props.extra && (
						<Header as="h3" size="medium">
							{props.createdBy
								? `What's needed to change ${props.createdBy.name}'s mind`
								: ""}
							<EditButton props={props} type="extra" />
						</Header>
					)}
					{editingExtra ? (
						<Form onSubmit={this.updateDiscussion}>
							<Form.Field>
								<TextArea
									autoHeight
									onChange={this.updateExtra}
									placeholder="What is your evidence? Try to use reputable sources."
									rows={15}
									value={props.extra}
								/>
							</Form.Field>
							<Button
								className="updateDiscussionBtn"
								color="blue"
								compact
								content="Update"
								fluid
								type="submit"
							/>
						</Form>
					) : (
						<div>
							{props.extra && (
								<div
									dangerouslySetInnerHTML={{
										__html: sanitizeText(Marked(props.extra))
									}}
								/>
							)}
						</div>
					)}
				</div>
			)
		}
		const HeaderSection = ({ props }) => {
			let subheader = null
			if (props.createdBy) {
				subheader = (
					<div>
						Created <Moment date={createdAt} fromNow interval={60000} /> by{" "}
						<Link to={`/users/${props.createdBy.username}`}>
							{props.createdBy.name}
						</Link>
					</div>
				)
			}
			return (
				<TitleHeader
					bearer={bearer}
					dividing
					id={id}
					canEdit={isMine}
					subheader={subheader}
					title={props.title}
					type="discussion"
				/>
			)
		}
		const ShowTags = props => {
			let tags = null
			if (props.tagIds) {
				tags = mapIdsToNames(props.tagIds, props.tagNames)
			}

			return (
				<TagsCard
					bearer={bearer}
					canEdit={isMine}
					history={props.history}
					id={props.id}
					tags={tags ? tags : []}
					type="discussion"
				/>
			)
		}

		return (
			<Provider store={store}>
				<div className="discussionPage">
					<DisplayMetaTags page="discussion" props={this.props} state={this.state} />
					<PageHeader {...this.props} />
					{!this.props.error ? (
						<Container className="mainContainer" textAlign="left">
							<HeaderSection props={this.props} />
							<Responsive maxWidth={1024}>
								<Grid>
									<Grid.Row>
										{EvidenceSection(this.props)}
										<Divider horizontal />
										<Conversation
											acceptance={this.props.acceptance}
											acceptedBy={this.props.acceptedBy}
											authenticated={authenticated}
											bearer={bearer}
											createdBy={this.props.createdBy}
											discussionId={id}
											loading={this.props.convoLoading}
											source="discussion"
											status={this.props.status}
										/>
									</Grid.Row>
									<Grid.Row>{ShowTags(this.props)}</Grid.Row>
								</Grid>
							</Responsive>
							<Responsive minWidth={1025}>
								<Grid>
									<Grid.Column className="leftSide" width={12}>
										{EvidenceSection(this.props)}
										<Divider horizontal />
										<Conversation
											acceptance={this.props.acceptance}
											acceptedBy={this.props.acceptedBy}
											authenticated={authenticated}
											bearer={bearer}
											createdBy={this.props.createdBy}
											discussionId={id}
											loading={this.props.convoLoading}
											source="discussion"
											status={this.props.status}
										/>
									</Grid.Column>
									<Grid.Column className="rightSide" width={4}>
										{ShowTags(this.props)}
									</Grid.Column>
								</Grid>
							</Responsive>
						</Container>
					) : (
						<Container className="mainContainer" text textAlign="center">
							<Image centered className="trumpImg404" size="medium" src={TrumpImg} />
							<Header size="medium">This discussion does not exist!</Header>
						</Container>
					)}
					<PageFooter />
				</div>
			</Provider>
		)
	}
}

DiscussionPage.propTypes = {
	acceptance: PropTypes.string,
	acceptedBy: PropTypes.shape({
		id: PropTypes.number,
		img: PropTypes.string,
		name: PropTypes.string,
		username: PropTypes.string
	}),
	createdBy: PropTypes.shape({
		id: PropTypes.number,
		img: PropTypes.string,
		name: PropTypes.string,
		username: PropTypes.string
	}),
	convoLoading: PropTypes.bool,
	dateCreated: PropTypes.string,
	description: PropTypes.string,
	error: PropTypes.bool,
	extra: PropTypes.string,
	fetchDiscussion: PropTypes.func,
	id: PropTypes.number,
	status: PropTypes.number,
	tagIds: PropTypes.string,
	tagNames: PropTypes.string,
	title: PropTypes.string,
	updateDescription: PropTypes.func,
	updateDiscussion: PropTypes.func,
	updateExtra: PropTypes.func
}

DiscussionPage.defaultProps = {
	convoLoading: true,
	fetchDiscussion,
	user: null,
	updateDescription,
	updateDiscussion,
	updateExtra
}

const mapStateToProps = (state, ownProps) => {
	return {
		...state.discussion,
		...ownProps
	}
}

export default connect(mapStateToProps, {
	fetchDiscussion,
	updateDescription,
	updateDiscussion,
	updateExtra
})(DiscussionPage)
