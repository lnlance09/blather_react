import "./style.css"
import { Link } from "react-router-dom"
import { sanitizeText } from "utils/textFunctions"
import {
	Divider,
	Header,
	Icon,
	Image,
	Label,
	Message,
	Placeholder,
	Progress,
	Segment
} from "semantic-ui-react"
import Marked from "marked"
import PropTypes from "prop-types"
import React, { Component } from "react"

class Breakdown extends Component {
	constructor(props) {
		super(props)
		this.state = {
			options: [{}]
		}
	}

	componentDidMount() {
		this.fetchFallacies(this.props)
	}

	componentWillReceiveProps(props) {
		if (this.props.id !== props.id) {
			this.fetchFallacies(props)
		}
	}

	fetchFallacies(props) {
		const qs = `?id=${props.id}&type=pages&network=${props.network}`
		return fetch(`${window.location.origin}/api/fallacies/uniqueFallacies${qs}`, {
			headers: {
				"Content-Type": "application/json"
			}
		})
			.then(response => {
				if (response.ok) {
					response.json().then(data => {
						this.setState({ options: data.fallacies })
					})
				}
			})
			.catch(err => console.log(err))
	}

	render() {
		const { options } = this.state
		const {
			authenticated,
			dbId,
			placeholder,
			setFallacyId,
			sincerity,
			turingTest,
			userId
		} = this.props

		const RenderFallacies = () => {
			return options.map((result, i) => {
				if (result.key) {
					const percent = parseInt((result.count / this.props.count) * 100, 10)
					return (
						<div
							className={`fallacyPercentage ${this.props.network}`}
							key={`breakdownResult${i}`}
							onClick={() => setFallacyId(result.value)}
						>
							<Header size="small">
								{result.key}{" "}
								<Label basic horizontal>
									{result.count}
								</Label>
							</Header>
							<Progress percent={percent} progress size="medium" />
						</div>
					)
				}
				return null
			})
		}

		const Stats = props =>
			props.count === 0 ? (
				"Nobody answered"
			) : (
				<span>
					{`${props.yes}`} yes {", "}
					{`${props.no}`} no
				</span>
			)

		return (
			<div className="breakdown">
				<div>
					<Header as="h2" attached="top">
						Breakdown
					</Header>
					{this.props.id ? (
						<Segment attached className="breakdownSegment">
							<Message
								content={`A measure of ${
									this.props.name
								}'s level of partisanship, logical consistency, and intellectual honesty.`}
								header="How reputable is this source?"
								icon="question"
							/>

							{options.length > 0 ? (
								<Segment basic className="percentages">
									{RenderFallacies()}
								</Segment>
							) : (
								<Message content="No fallacies have been assigned" />
							)}
						</Segment>
					) : (
						<Segment attached>
							<Placeholder fluid>
								<Placeholder.Paragraph>
									<Placeholder.Line length="full" />
									<Placeholder.Line length="full" />
									<Placeholder.Line length="full" />
									<Placeholder.Line length="full" />
									<Placeholder.Line length="full" />
									<Placeholder.Line length="full" />
									<Placeholder.Line length="full" />
									<Placeholder.Line length="full" />
									<Placeholder.Line length="full" />
									<Placeholder.Line length="full" />
									<Placeholder.Line length="full" />
									<Placeholder.Line length="full" />
								</Placeholder.Paragraph>
							</Placeholder>
						</Segment>
					)}

					<Header as="h3" attached>
						Grifter or Lazy Thinker?
					</Header>
					<Segment attached className="questionnaire">
						{placeholder.id && (
							<div>
								<Header className="first" size="small">
									<Image avatar bordered src={placeholder.user_img} /> Here's how{" "}
									<Link to={`/users/${placeholder.user_id}`}>
										{placeholder.user_name}
									</Link>{" "}
									has described this source.
								</Header>
								<Icon name="quote left" />
								<blockquote
									cite={`https://blather.io/targets/${userId}/${dbId}`}
									className="placeholderDiv"
									dangerouslySetInnerHTML={{
										__html: sanitizeText(Marked(placeholder.summary))
									}}
								/>
								<Icon name="quote right" />
								<p className="fullReview">
									<Link to={`/targets/${userId}/${dbId}`}>See full review</Link>
								</p>
								<Divider />
							</div>
						)}
						<Header size="small">
							Can pass an{" "}
							<a
								href="https://www.econlib.org/archives/2011/06/the_ideological.html"
								rel="noopener noreferrer"
								target="_blank"
							>
								Ideological Turing Test
							</a>
							?<Header.Subheader>{Stats(turingTest)}</Header.Subheader>
						</Header>

						<Header size="small">
							Believes most of what they talk about?
							<Header.Subheader>{Stats(sincerity)}</Header.Subheader>
						</Header>

						<Header size="small">
							<Icon
								color="yellow"
								name="star"
								size="small"
								style={{ display: "inline-block" }}
							/>{" "}
							<Link to={`/targets/${authenticated ? userId : "create"}/${dbId}`}>
								Create a review
							</Link>
						</Header>
					</Segment>
				</div>
			</div>
		)
	}
}

Breakdown.propTypes = {
	authenticated: PropTypes.bool,
	count: PropTypes.number,
	dbId: PropTypes.number,
	id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	name: PropTypes.string,
	network: PropTypes.string,
	placeholder: PropTypes.shape({
		id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		summary: PropTypes.string,
		user_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
		user_img: PropTypes.string,
		user_name: PropTypes.string
	}),
	setFallacyId: PropTypes.func,
	sincerity: PropTypes.object,
	turingTest: PropTypes.object,
	userId: PropTypes.number,
	username: PropTypes.string
}

Breakdown.defaultProps = {
	id: 0,
	placeholder: {},
	sincerity: {},
	turingTest: {}
}

export default Breakdown
