import "./style.css"
import { editExplanation, updateFallacy } from "redux/actions/fallacy"
import { adjustTimezone, dateDifference, formatTime } from "utils/dateFunctions"
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
	List,
	Segment,
	TextArea
} from "semantic-ui-react"
import ImagePic from "images/images/image-square.png"
import LazyLoad from "components/primary/lazyLoad/v1/"
import Marked from "marked"
import Moment from "react-moment"
import PropTypes from "prop-types"
import React, { Component } from "react"
import request from "request"
import TimeField from "react-simple-timefield"
import Tweet from "components/primary/tweet/v1/"
import UserPic from "images/avatar/large/steve.jpg"
import YouTubeCommentsSection from "components/secondary/youTubeVideo/v1/comments"
import YouTubeVideo from "components/secondary/youTubeVideo/v1/"

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
	}

	componentDidMount() {
		this.setState({
			endTime: this.props.endTime > 0 ? formatTime(this.props.endTime) : "",
			startTime: this.props.startTime > 0 ? formatTime(this.props.startTime) : ""
		})

		if (this.props.contradiction && this.props.contradiction.video) {
			const endTime = this.props.contradiction.video.endTime
			const startTime = this.props.contradiction.video.startTime
			this.setState({
				contradictionEndTime: endTime > 0 ? formatTime(endTime) : "",
				contradictionStartTime: startTime > 0 ? formatTime(startTime) : ""
			})
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps !== this.props) {
			this.setState({
				endTime: this.props.endTime > 0 ? formatTime(this.props.endTime) : "",
				startTime: this.props.startTime > 0 ? formatTime(this.props.startTime) : ""
			})

			if (this.props.contradiction && this.props.contradiction.video) {
				const endTime = this.props.contradiction.video.endTime
				const startTime = this.props.contradiction.video.startTime
				this.setState({
					contradictionEndTime: endTime > 0 ? formatTime(endTime) : "",
					contradictionStartTime: startTime > 0 ? formatTime(startTime) : ""
				})
			}
		}
	}

	createArchive = url => {
		request.post(
			`${window.location.origin}/api/home/createArchive`,
			{
				form: {
					url
				},
				json: true
			},
			function(err, response, body) {
				if (body.error) {
					console.log("error")
				} else {
					window.open(`http://archive.is/${body.code}`, "_blank").focus()
				}
			}
		)
	}

	onChangeEndTime = (time, contradiction) => {
		if (contradiction) {
			this.setState({ contradictionEndTime: time })
		} else {
			this.setState({ endTime: time })
		}
	}

	onChangeExplanation = (e, { value }) => this.setState({ explanation: value })

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

	updateFallacy = e => {
		e.preventDefault()
		this.setState(
			{
				editing: false,
				loading: true
			},
			() => {
				this.props.updateFallacy({
					bearer: this.props.bearer,
					id: this.props.id,
					explanation: this.state.explanation,
					fallacyId: parseInt(this.props.fallacyId, 10),
					fallacyName: this.props.fallacyName
				})
			}
		)
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
			if (props.explanation && props.canEdit) {
				return (
					<Icon
						className={`editButton ${editing ? "editing" : ""}`}
						name={editing ? "close" : "pencil"}
						onClick={this.onClickEdit}
					/>
				)
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
					inverted
					name={contradiction ? "contradictionTimeForm" : "timeForm"}
					onSubmit={this.updateTimes}
					size="big"
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
					{open && <Button color="blue" content="Update times" fluid />}
				</Form>
			)
		}

		const Explanation = props => {
			if (props.showExplanation && props.explanation) {
				const explanationEl = (
					<div>
						<Header as="h2" className="fallacyHeader" inverted size="large">
							{props.fallacyName} <EditButton props={props} />
						</Header>
						<Segment attached className="fallacyExplanationSegment" inverted>
							{editing ? (
								<Form onSubmit={this.updateFallacy} size="large">
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
										content="Update"
										fluid
										size="large"
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
						</Segment>
						<Header
							className="aboutAttachedHeader"
							attached="bottom"
							inverted
							size="small"
						>
							<Image
								avatar
								onClick={() =>
									this.props.history.push(`/${this.props.creator.username}`)
								}
								onError={i => (i.target.src = UserPic)}
								src={
									this.props.creator.img === null
										? UserPic
										: this.props.creator.img
								}
							/>
							<Header.Content>
								<a
									className="userLink"
									href="#"
									onClick={() =>
										this.props.history.push(
											`/users/${this.props.creator.username}`
										)
									}
								>
									{this.props.creator.name}
								</a>
								<Header.Subheader>
									Created{" "}
									<Moment date={adjustTimezone(this.props.updatedAt)} fromNow />
								</Header.Subheader>
							</Header.Content>
						</Header>
					</div>
				)

				if (props.exportOpt !== "screenshotAll") {
					return (
						<Segment
							basic
							className={`fallacyExplanation ${
								props.downloading ? "downloading" : ""
							}`}
							data-html2canvas-ignore
						>
							{explanationEl}
						</Segment>
					)
				}

				return (
					<Segment
						basic
						className={`fallacyExplanation ${props.downloading ? "downloading" : ""}`}
					>
						{explanationEl}
					</Segment>
				)
			}

			if (!props.showExplanation) {
				return false
			}

			return <LazyLoad header={false} />
		}

		const FeaturedInVideo = (video, props) => {
			if (video.channel.id !== props.user.id && !video.comment) {
				const link = `/pages/${props.user.type}/${
					props.user.type === "twitter" ? props.user.username : props.user.id
				}`
				return (
					<List inverted>
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
			<div
				className={`fallacyMaterial ${props.downloading ? "downloading" : ""}`}
				id="fallacyMaterial"
			>
				{props.user ? (
					<div>
						{props.rawSources ? (
							<div>
								<List className="sourceList" size="large">
									{ParseMaterial(props)}
									{props.contradiction && ParseMaterial(props, true)}
								</List>
							</div>
						) : (
							<div>
								{ParseMaterial(props)}
								{props.contradiction && (
									<div>
										{ShowDateDifference(props)}
										{ParseMaterial(props, true)}
									</div>
								)}
							</div>
						)}
					</div>
				) : (
					<LazyLoad header={!props.rawSources} />
				)}
			</div>
		)

		const ParseMaterial = (props, contradiction = false) => {
			let material = props
			if (contradiction) {
				material = props.contradiction
			}
			if (material.tweet) {
				if (props.rawSources) {
					const tweetLink = `https://twitter.com/${material.tweet.user.screen_name}/status/${material.tweet.id_str}`
					return (
						<List.Item>
							<List.Icon className="twitterIcon" name="twitter" />
							<List.Content>
								<a
									href={tweetLink}
									onClick={e => {
										e.preventDefault()
										if (e.metaKey || e.shiftKey) {
											this.createArchive(tweetLink)
										} else {
											window.open(tweetLink, "_blank").focus()
										}
									}}
								>
									{tweetLink}
								</a>
							</List.Content>
						</List.Item>
					)
				}
				return (
					<div id={`tweet${contradiction ? "Contradiction" : "Original"}`}>
						<Tweet
							archive={material.tweet.archive}
							bearer={props.bearer}
							created_at={material.tweet.created_at}
							displayTextRange={material.tweet.display_text_range}
							extended_entities={material.tweet.extended_entities}
							externalLink
							full_text={material.tweet.full_text}
							highlight={material.highlightedText !== null}
							highlightedText={
								material.highlightedText ? material.highlightedText.trim() : ""
							}
							history={props.history}
							id={material.tweet.id_str}
							imageSize="medium"
							is_quote_status={material.tweet.is_quote_status}
							opacity={props.opacity}
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
				if (props.rawSources) {
					const videoLink = `https://www.youtube.com/watch?v=${material.video.id}`
					return (
						<List.Item>
							<List.Icon className="youtubeIcon" name="youtube" />
							<List.Content>
								<a href={videoLink} rel="noopener noreferrer" target="_blank">
									{videoLink}
								</a>
							</List.Content>
						</List.Item>
					)
				}
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
					<Divider hidden horizontal id="fallacyDateDiff" inverted>
						<Icon inverted name="clock outline" style={{ marginRight: "5px" }} />{" "}
						{dateDifference(dateOne, dateTwo)}
					</Divider>
				)
			}
			return null
		}

		return (
			<div className="fallacyExample" id="fallacyExample" style={{ width: this.props.width }}>
				{this.props.showMaterial && Material(this.props)}
				{Explanation(this.props)}
			</div>
		)
	}
}

FallacyExample.propTypes = {
	bearer: PropTypes.string,
	canEdit: PropTypes.bool,
	creator: PropTypes.shape({
		img: PropTypes.string,
		name: PropTypes.string,
		username: PropTypes.string
	}),
	downloading: PropTypes.bool,
	editExplanation: PropTypes.func,
	exportOpt: PropTypes.string,
	opacity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	rawSources: PropTypes.bool,
	showExplanation: PropTypes.bool,
	showMaterial: PropTypes.bool,
	updatedAt: PropTypes.string,
	width: PropTypes.string
}

FallacyExample.defaultProps = {
	canEdit: false,
	creator: {},
	downloading: false,
	editExplanation,
	opacity: 1,
	rawSources: false,
	showExplanation: true,
	showMaterial: true,
	width: "100%"
}

const mapStateToProps = (state, ownProps) => ({
	...state.fallacy,
	...ownProps
})

export default connect(mapStateToProps, {
	editExplanation,
	updateFallacy
})(FallacyExample)
