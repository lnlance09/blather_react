import "./style.css"
import { editExplanation, updateFallacy } from "pages/actions/fallacy"
import { dateDifference, formatTime } from "utils/dateFunctions"
import { fallacyDropdownOptions } from "utils/fallacyFunctions"
import { convertTimeToSeconds, formatDuration, sanitizeText } from "utils/textFunctions"
import { connect } from "react-redux"
import {
	Button,
	Divider,
	Dropdown,
	Form,
	Header,
	Icon,
	Image,
	Input,
	Label,
	List,
	Segment,
	TextArea
} from "semantic-ui-react"
import ImagePic from "images/image-square.png"
import WatermarkImg from "images/brain-logo-white-small.png"
import LazyLoad from "components/lazyLoad/v1/"
import Marked from "marked"
import PropTypes from "prop-types"
import React, { Component } from "react"
import TimeField from "react-simple-timefield"
import Tweet from "components/tweet/v1/"
import YouTubeCommentsSection from "components/youTubeVideo/v1/comments"
import YouTubeVideo from "components/youTubeVideo/v1/"

class FallacyExample extends Component {
	constructor(props) {
		super(props)
		this.state = {
			contradictionEndTime: "",
			contradictionStartTime: "",
			editing: false,
			editingContradictionTimes: false,
			editingTimes: false,
			endTime: "",
			explanation: "",
			loading: false,
			startTime: ""
		}

		this.onChangeEndTime = this.onChangeEndTime.bind(this)
		this.onChangeExplanation = this.onChangeExplanation.bind(this)
		this.onChangeFallacy = this.onChangeFallacy.bind(this)
		this.onChangeStartTime = this.onChangeStartTime.bind(this)
		this.onClickEdit = this.onClickEdit.bind(this)
		this.setEditMode = this.setEditMode.bind(this)
		this.updateFallacy = this.updateFallacy.bind(this)
		this.updateTimes = this.updateTimes.bind(this)
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			endTime: newProps.endTime > 0 ? formatTime(newProps.endTime) : "",
			startTime: newProps.startTime > 0 ? formatTime(newProps.startTime) : ""
		})

		if (newProps.contradiction && newProps.contradiction.video) {
			const endTime = newProps.contradiction.video.endTime
			const startTime = newProps.contradiction.video.startTime
			this.setState({
				contradictionEndTime: endTime > 0 ? formatTime(endTime) : "",
				contradictionStartTime: startTime > 0 ? formatTime(startTime) : ""
			})
		}
	}

	onChangeEndTime = (time, contradiction) => {
		if (contradiction) {
			this.setState({ contradictionEndTime: time })
		} else {
			this.setState({ endTime: time })
		}
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

	onChangeStartTime = (time, contradiction) => {
		if (contradiction) {
			this.setState({ contradictionStartTime: time })
		} else {
			this.setState({ startTime: time })
		}
	}

	onClickEdit = () => {
		this.setState({
			editing: this.state.editing === false,
			explanation: this.props.explanation
		})
	}

	setEditMode = contradiction => {
		if (contradiction) {
			this.setState({ editingContradictionTimes: true })
		} else {
			this.setState({ editingTimes: true })
		}
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

	updateTimes = (e, { name }) => {
		e.preventDefault()
		this.props.updateFallacy({
			bearer: this.props.bearer,
			contradictionEndTime: convertTimeToSeconds(this.state.contradictionEndTime),
			contradictionStartTime: convertTimeToSeconds(this.state.contradictionStartTime),
			endTime: convertTimeToSeconds(this.state.endTime),
			id: this.props.id,
			startTime: convertTimeToSeconds(this.state.startTime)
		})

		if (name === "contradictionTimeForm") {
			this.setState({ editingContradictionTimes: false })
		}

		if (name === "timeForm") {
			this.setState({ editingTimes: false })
		}
	}

	render() {
		const {
			contradictionEndTime,
			contradictionStartTime,
			editing,
			editingContradictionTimes,
			editingTimes,
			endTime,
			explanation,
			startTime
		} = this.state
		const EditButton = ({ props }) => {
			if (props.explanation) {
				if (props.canEdit) {
					return (
						<Icon
							className={`editButton ${editing ? "editing" : ""}`}
							name={editing ? "close" : "pencil"}
							onClick={this.onClickEdit}
						/>
					)
				}
			}
			return null
		}
		const EditTimesForm = (props, contradiction) => {
			const endName = contradiction ? "contradictionEndTime" : "endTime"
			const startName = contradiction ? "contradictionStartTime" : "startTime"
			const open = contradiction ? editingContradictionTimes : editingTimes
			return (
				<Form
					className="editTimesForm"
					name={contradiction ? "contradictionTimeForm" : "timeForm"}
					onSubmit={this.updateTimes}
				>
					<Form.Group widths="equal">
						<Form.Field>
							<TimeField
								input={
									<Input
										className={startName}
										icon="hourglass start"
										name={startName}
										onClick={() => this.setEditMode(contradiction)}
										placeholder="Start time"
										readOnly={!open}
									/>
								}
								onChange={time => this.onChangeStartTime(time, contradiction)}
								showSeconds
								style={{ width: "100%", fontSize: 14 }}
								value={contradiction ? contradictionStartTime : startTime}
							/>
						</Form.Field>
						<Form.Field>
							<TimeField
								input={
									<Input
										className={endName}
										icon="hourglass end"
										name={startName}
										onClick={() => this.setEditMode(contradiction)}
										placeholder="Start time"
										readOnly={!open}
									/>
								}
								onChange={time => this.onChangeEndTime(time, contradiction)}
								showSeconds
								style={{ width: "100%", fontSize: 14 }}
								value={contradiction ? contradictionEndTime : endTime}
							/>
						</Form.Field>
					</Form.Group>
					{open && <Button color="blue" compact content="Update times" fluid />}
				</Form>
			)
		}
		const Explanation = props => {
			if (props.showExplanation) {
				return (
					<Segment basic className="fallacyExplanation">
						<Header as="h2" className="fallacyHeader" size="medium">
							{props.fallacyName} <EditButton props={props} />
							{props.downloading && props.exportOpt === "screenshotAll"
								? WatermarkLabel(props)
								: null}
						</Header>
						{props.explanation ? (
							<div>
								{editing ? (
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
										<Form.Field className="explanationField">
											<TextArea
												autoHeight
												onChange={this.onChangeExplanation}
												placeholder="Why is this a fallacy?"
												rows={10}
												value={explanation}
											/>
										</Form.Field>
										<Button
											className="updateBtn"
											color="blue"
											compact
											content="Update"
											fluid
											type="submit"
										/>
										<p className="commonMarkLink">
											<a
												href="https://spec.commonmark.org/0.28/"
												rel="noopener noreferrer"
												target="_blank"
											>
												view commonmark specs
											</a>
											<span className="clearfix" />
										</p>
									</Form>
								) : (
									<div
										className="explanation"
										dangerouslySetInnerHTML={{
											__html: sanitizeText(Marked(props.explanation))
										}}
									/>
								)}
							</div>
						) : (
							<LazyLoad header={false} segment={false} />
						)}
					</Segment>
				)
			}
			return null
		}
		const FeaturedInVideo = (video, props) => {
			if (video.channel.id !== props.user.id && !video.comment) {
				const link = `/pages/${props.user.type}/${
					props.user.type === "twitter" ? props.user.username : props.user.id
				}`
				return (
					<List>
						<List.Item>
							<Image
								avatar
								onError={i => (i.target.src = ImagePic)}
								src={props.user.img}
							/>
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
			<div className="fallacyMaterial" id="fallacyMaterial">
				{props.user ? (
					<div>
						{props.downloading && props.exportOpt === "screenshot"
							? WatermarkLabel(props)
							: null}
						{ParseMaterial(props)}
						{props.contradiction && (
							<div>
								{ShowDateDifference(props)}
								{ParseMaterial(props, true)}
							</div>
						)}
					</div>
				) : (
					<LazyLoad />
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
					<div id={`tweet${contradiction ? "Contradiction" : "Original"}`}>
						<Tweet
							archive={material.tweet.archive}
							bearer={props.bearer}
							created_at={material.tweet.created_at}
							extended_entities={material.tweet.extended_entities}
							externalLink
							full_text={material.tweet.full_text}
							highlight={material.highlightedText !== null}
							highlightedText={
								material.highlightedText ? material.highlightedText.trim() : ""
							}
							id={material.tweet.id_str}
							imageSize="medium"
							is_quote_status={material.tweet.is_quote_status}
							profileImg={material.user.img}
							quoted_status={
								material.tweet.quoted_status === undefined &&
								material.tweet.is_quote_status
									? material.tweet.retweeted_status
									: material.tweet.quoted_status
							}
							quoted_status_id_str={material.tweet.quoted_status_id_str}
							quoted_status_permalink={material.tweet.quoted_status_permalink}
							redirect
							retweeted_status={
								material.tweet.retweeted_status === undefined
									? false
									: material.tweet.retweeted_status
							}
							stats={{
								favorite_count: material.tweet.favorite_count,
								retweet_count: material.tweet.retweet_count
							}}
							useLocalProfilePic
							user={material.tweet.user}
							{...props.history}
						/>
					</div>
				)
			}
			if (material.video) {
				return (
					<div>
						<YouTubeVideo
							channel={material.video.channel}
							controls
							dateCreated={material.video.dateCreated}
							description={material.video.description}
							endTime={material.video.endTime}
							history={props.history}
							id={material.video.id}
							redirect
							showChannel={false}
							showStats={false}
							source="fallacy"
							startTime={material.video.startTime}
							stats={material.video.stats}
							title={material.video.title}
							{...props.history}
						/>
						{props.canEdit ? EditTimesForm(props, contradiction) : null}
						{FeaturedInVideo(material.video, props)}
					</div>
				)
			}
			if (material.comment) {
				return (
					<div id={`comment${contradiction ? "Contradiction" : "Original"}`}>
						<YouTubeCommentsSection
							auth={false}
							bearer={props.bearer}
							comment={material.comment}
							handleHoverOn={this.handleHoverOn}
							highlightedText={
								material.highlightedText ? material.highlightedText.trim() : ""
							}
							history={props.history}
							showComment
							showComments={false}
							source="fallacy"
							videoId={material.comment.videoId}
						/>
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
				}
				if (props.comment) {
					dateOne = props.comment.dateCreated
				}

				if (props.contradiction.tweet) {
					dateTwo = props.contradiction.tweet.created_at
				}
				if (props.contradiction.video) {
					dateTwo = props.contradiction.video.dateCreated
				}
				if (props.contradiction.comment) {
					dateTwo = props.contradiction.comment.dateCreated
				}
				return (
					<Divider horizontal id="fallacyDateDiff">
						{dateDifference(dateOne, dateTwo)}
					</Divider>
				)
			}
			return null
		}
		const WatermarkLabel = props => (
			<Label color="blue" className="watermarkLabel">
				<Image src={WatermarkImg} />
				blather.io/fallacies/{props.id}
			</Label>
		)

		return (
			<Segment className="fallacyExample" id="fallacyExample">
				{Explanation(this.props)}
				{Material(this.props)}
			</Segment>
		)
	}
}

FallacyExample.propTypes = {
	bearer: PropTypes.string,
	canEdit: PropTypes.bool,
	downloading: PropTypes.bool,
	editExplanation: PropTypes.func,
	exportOpt: PropTypes.string,
	showExplanation: PropTypes.bool
}

FallacyExample.defaultProps = {
	canEdit: false,
	downloading: false,
	editExplanation,
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
