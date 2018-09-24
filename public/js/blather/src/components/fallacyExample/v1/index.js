import "./style.css"
import { editExplanation, updateFallacy } from "pages/actions/fallacy"
import { dateDifference } from "utils/dateFunctions"
import { fallacyDropdownOptions } from "utils/fallacyFunctions"
import { formatDuration } from "utils/textFunctions"
import { connect } from "react-redux"
import {
	Button,
	Divider,
	Dropdown,
	Form,
	Header,
	Icon,
	Image,
	List,
	Segment,
	TextArea
} from "semantic-ui-react"
import nl2br from "react-nl2br"
import ParagraphPic from "images/short-paragraph.png"
import PropTypes from "prop-types"
import React, { Component } from "react"
import Tweet from "components/tweet/v1/"
import YouTubeVideo from "components/youTubeVideo/v1/"

class FallacyExample extends Component {
	constructor(props) {
		super(props)
		this.state = {
			editing: false,
			explanation: "",
			loading: false
		}

		this.onChangeExplanation = this.onChangeExplanation.bind(this)
		this.onChangeFallacy = this.onChangeFallacy.bind(this)
		this.onClickEdit = this.onClickEdit.bind(this)
		this.updateFallacy = this.updateFallacy.bind(this)
	}

	onChangeExplanation = (e, { value }) => {
		this.setState({ explanation: value })
	}

	onChangeFallacy = (e, { value }) => {
		this.props.updateFallacy({
			bearer: this.props.bearer,
			id: this.props.id,
			explanation: this.props.explanation,
			fallacyId: parseInt(value, 10),
			fallacyName: e.target.textContent
		})
	}

	onClickEdit = () => {
		this.setState({
			editing: this.state.editing === false,
			explanation: this.props.explanation
		})
	}

	updateFallacy(e) {
		e.preventDefault()
		this.setState({
			editing: false,
			loading: true
		})
		this.props.updateFallacy({
			bearer: this.props.bearer,
			id: this.props.id,
			explanation: this.state.explanation,
			fallacyId: parseInt(this.props.fallacyId, 10),
			fallacyName: this.props.fallacyName
		})
	}

	render() {
		const { editing, explanation } = this.state
		const EditButton = ({ props }) => {
			if (props.explanation) {
				if (props.canEdit) {
					if (editing) {
						return (
							<Icon
								className="editButton editing"
								name="close"
								onClick={this.onClickEdit}
							/>
						)
					}
					return <Icon className="editButton" name="pencil" onClick={this.onClickEdit} />
				}
			}
			return null
		}
		const Explanation = props => (
			<div className="fallacyExplanation">
				<Header as="h2" size="medium">
					{props.fallacyName}
					<EditButton props={props} />
				</Header>
				{props.fallacyId && (
					<div>
						{editing && (
							<Form onSubmit={this.updateFallacy}>
								<Form.Field>
									<Dropdown
										className="fallacyDropdown"
										defaultValue={`${props.fallacyId}`}
										onChange={this.onChangeFallacy}
										options={fallacyDropdownOptions}
										placeholder="Select a fallacy"
										search
										selection
									/>
								</Form.Field>
								<Form.Field>
									<TextArea
										onChange={this.onChangeExplanation}
										placeholder="Why is this a fallacy?"
										rows={10}
										value={explanation}
									/>
								</Form.Field>
								<Button
									className="updateBtn"
									compact
									content="Update"
									fluid
									type="submit"
								/>
							</Form>
						)}
						{!editing && <p>{nl2br(props.explanation)}</p>}
					</div>
				)}
				{!props.explanation && (
					<Segment className="lazyLoadSegment" loading>
						<Image fluid src={ParagraphPic} />
					</Segment>
				)}
			</div>
		)
		const FeaturedInVideo = (video, props) => {
			if (video.channel.id !== props.user.id && !video.comment) {
				const link = `/pages/${props.user.type}/${
					props.user.type === "twitter" ? props.user.username : props.user.id
				}`
				return (
					<List>
						<List.Item>
							<Image avatar src={props.user.img} />
							<List.Content>
								<List.Header as="a" onClick={() => props.history.push(link)}>
									{props.user.name}
								</List.Header>
								<List.Description>
									Is in this video{" "}
									{video.startTime > 0
										? `at ${formatDuration(video.startTime)}`
										: ""}
								</List.Description>
							</List.Content>
						</List.Item>
					</List>
				)
			}
		}
		const Material = props => (
			<div className="fallacyMaterial">
				<Header as="h3" size="medium">
					Material
				</Header>
				{props.user && (
					<div>
						{ParseMaterial(props)}
						{ShowDateDifference(props)}
						{this.props.contradiction && <div>{ParseMaterial(props, true)}</div>}
					</div>
				)}
				{!this.props.user && (
					<Segment className="lazyLoadSegment" loading>
						<Image fluid src={ParagraphPic} />
					</Segment>
				)}
			</div>
		)
		const ParseMaterial = (props, contradiction = false) => {
			let material = props
			if (contradiction) {
				material = props.contradiction
			}
			if (material.tweet) {
				return (
					<Tweet
						archive={material.tweet.archive}
						bearer={props.bearer}
						canArchive
						created_at={material.tweet.created_at}
						extended_entities={material.tweet.extended_entities}
						full_text={material.tweet.full_text}
						id={material.tweet.id_str}
						is_quote_status={material.tweet.is_quote_status}
						quoted_status={
							material.tweet.quoted_status === undefined &&
							material.tweet.is_quote_status
								? material.tweet.retweeted_status
								: material.tweet.quoted_status
						}
						quoted_status_id_str={material.tweet.quoted_status_id_str}
						quoted_status_permalink={material.tweet.quoted_status_permalink}
						retweeted_status={
							material.tweet.retweeted_status === undefined
								? false
								: material.tweet.retweeted_status
						}
						stats={{
							favorite_count: material.tweet.favorite_count,
							retweet_count: material.tweet.retweet_count
						}}
						user={material.tweet.user}
					/>
				)
			}
			if (material.video) {
				return (
					<div>
						<YouTubeVideo
							channel={material.video.channel}
							comment={material.video.comment}
							dateCreated={material.video.dateCreated}
							description={material.video.description}
							history={props.history}
							id={material.video.id}
							showChannel={false}
							showComment={material.video.comment !== null}
							showStats={false}
							startTime={material.video.startTime}
							stats={material.video.stats}
							title={material.video.title}
						/>
						{FeaturedInVideo(material.video, props)}
					</div>
				)
			}
			return null
		}
		const ShowDateDifference = props => {
			if (props.contradiction) {
				let dateOne = ""
				let dateTwo = ""
				if (props.tweet) {
					dateOne = props.tweet.created_at
				}
				if (props.video) {
					dateOne = props.video.dateCreated
					if (props.video.comment) {
						dateOne = props.video.comment.dateCreated
					}
				}

				if (props.contradiction.tweet) {
					dateTwo = props.contradiction.tweet.created_at
				}
				if (props.contradiction.video) {
					dateTwo = props.contradiction.video.dateCreated
					if (props.contradiction.video.comment) {
						dateTwo = props.contradiction.video.comment.dateCreated
					}
				}
				return <Divider horizontal>{dateDifference(dateOne, dateTwo)}</Divider>
			}
			return null
		}

		return (
			<div className="fallacyExample">
				{this.props.showExplanation && <div>{Explanation(this.props)}</div>}
				{Material(this.props)}
			</div>
		)
	}
}

FallacyExample.propTypes = {
	bearer: PropTypes.string,
	canEdit: PropTypes.bool,
	editExplanation: PropTypes.func,
	showExplanation: PropTypes.bool
}

FallacyExample.defaultProps = {
	canEdit: false,
	editExplanation: editExplanation,
	showExplanation: true
}

const mapStateToProps = (state, ownProps) => ({
	...state.fallacy,
	...ownProps
})

export default connect(
	mapStateToProps,
	{
		editExplanation,
		updateFallacy
	}
)(FallacyExample)
