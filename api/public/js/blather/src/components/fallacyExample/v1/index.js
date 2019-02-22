import "./style.css"
import { editExplanation, updateFallacy } from "pages/actions/fallacy"
import { dateDifference } from "utils/dateFunctions"
import { fallacyDropdownOptions } from "utils/fallacyFunctions"
import { sanitizeText } from "utils/textFunctions"
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
	Label,
	List,
	Segment,
	TextArea
} from "semantic-ui-react"
import html2canvas from "html2canvas"
import ImagePic from "images/image-square.png"
import LazyLoad from "components/lazyLoad/v1/"
import Marked from "marked"
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

		this.captureScreenshot = this.captureScreenshot.bind(this)
		this.onChangeExplanation = this.onChangeExplanation.bind(this)
		this.onChangeFallacy = this.onChangeFallacy.bind(this)
		this.onClickEdit = this.onClickEdit.bind(this)
		this.updateFallacy = this.updateFallacy.bind(this)
	}

	captureScreenshot = () => {
		const { createdAt, fallacyName, user } = this.props
		const filename = `${fallacyName}-by-${user.name}-${createdAt}`
		const width = document.getElementById("fallacyExample").offsetWidth
		const endPixel = width * 2
		const elements = document.getElementsByClassName("linkifyTweet")
		for (let i = 0; i < elements.length; i++) {
			elements[i].classList.add("downloading")
		}

		html2canvas(document.getElementById("fallacyExample"), {
			allowTaint: true,
			width: width
		}).then(canvas => {
			const ctx = canvas.getContext("2d")
			ctx.globalAlpha = 1
			ctx.font = "24px Arial"
			ctx.fillStyle = "#07f"
			ctx.fillText(`blather.io/fallacies/${this.props.id}`, endPixel - 320, 45)

			let link = document.createElement("a")
			link.download =
				filename
					.toLowerCase()
					.split(" ")
					.join("-") + ".png"
			link.href = canvas.toDataURL("image/png")
			link.click()
			for (let i = 0; i < elements.length; i++) {
				elements[i].classList.remove("downloading")
			}
		})
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
		const Explanation = props => {
			if (props.showExplanation) {
				return (
					<Segment basic className="fallacyExplanation">
						<Header as="h2" className="fallacyHeader" size="medium">
							{props.fallacyName} <EditButton props={props} />
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
						{ParseMaterial(props)}
						{ShowDateDifference(props)}
						{props.contradiction && <div>{ParseMaterial(props, true)}</div>}
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
							endTime={material.video.endTime}
							history={props.history}
							id={material.video.id}
							redirect
							showChannel
							showComment={material.video.comment !== null}
							showStats={false}
							startTime={material.video.startTime}
							stats={material.video.stats}
							title={material.video.title}
							{...props.history}
						/>
						{FeaturedInVideo(material.video, props)}
					</div>
				)
			}
			return null
		}
		const Ribbon = props => {
			if (
				props.tweet &&
				((props.contradiction ? props.contradiction.tweet : false) || !props.contradiction)
			) {
				return (
					<Label
						className="screenshot"
						color="orange"
						corner="left"
						onClick={this.captureScreenshot}
					>
						<Icon name="sticky note" />
					</Label>
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
			<Segment className="fallacyExample" id="fallacyExample" stacked>
				{Ribbon(this.props)}
				{Explanation(this.props)}
				{Material(this.props)}
			</Segment>
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
