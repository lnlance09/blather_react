import "./style.css"
import { Link } from "react-router-dom"
import {
	Button,
	Divider,
	Header,
	Icon,
	Label,
	Message,
	Placeholder,
	Progress,
	Segment
} from "semantic-ui-react"
import React, { Component } from "react"
import PropTypes from "prop-types"
import TextTruncate from "react-text-truncate"

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

	componentDidUpdate(prevProps) {
		if (this.props.id !== prevProps.id) {
			this.fetchFallacies(this.props)
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

		const ReviewButton = props => (
			<Button
				primary
				onClick={() =>
					props.history.push(`/targets/${authenticated ? userId : "create"}/${dbId}`)
				}
			>
				<Icon name="pencil" />
				Write a review
			</Button>
		)

		const OverallReliability = props => {
			let color = "green"
			let label = "Very Reliable"
			let percent = 100

			if (props.count > 5) {
				color = "yellow"
				label = "Borderline Grifter"
				percent = 50
			}

			if (props.count > 10) {
				color = "red"
				label = "Grifter"
				percent = 1
			}

			return (
				<div className="credibilityLevel">
					<Header inverted size="small">
						Credibility Level
						<Label color={color}>{label}</Label>
					</Header>
					<Progress color={color} inverted percent={percent} size="medium" />
				</div>
			)
		}

		const RenderFallacies = () => {
			return options.map((result, i) => {
				if (result.key) {
					const percent = ((result.count / this.props.count) * 100).toPrecision(2)
					return (
						<div
							className={`fallacyPercentage ${this.props.network}`}
							key={`breakdownResult${i}`}
							onClick={() => setFallacyId(result.value)}
						>
							<Header inverted size="small">
								{result.key}{" "}
								<Label basic color="red" className="fallacyCount" horizontal>
									{result.count}
								</Label>
							</Header>
							<Progress
								color="blue"
								inverted
								percent={percent}
								progress
								size="medium"
							/>
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
				<div className="breakdownSegment">
					{this.props.id ? (
						<div>
							<Message
								className="credMessage"
								content={`These are the logical fallacies that ${this.props.name} has committed`}
								header="How reliable is this source?"
								icon="question"
							/>

							{options.length > 0 ? (
								<div>
									{OverallReliability(this.props)}
									<Divider inverted section />
									<Segment basic className="percentages">
										{RenderFallacies()}
									</Segment>
								</div>
							) : (
								<Segment inverted placeholder>
									<Header icon>
										<Icon color="red" name="warning sign" />
										No fallacies have been assigned
									</Header>
								</Segment>
							)}
						</div>
					) : (
						<Segment>
							<Placeholder fluid inverted>
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

					<Header inverted size="large">
						Reviews
					</Header>

					{placeholder.id ? (
						<div>
							<Segment basic className="questionnaire">
								<Header inverted size="medium">
									Here's how{" "}
									<Link to={`/targets/${placeholder.user_id}/${dbId}`}>
										{placeholder.user_name}
									</Link>{" "}
									has described this source
								</Header>

								<Icon inverted name="quote left" />
								<blockquote
									cite={`https://blather.io/targets/${placeholder.user_id}/${dbId}`}
									className="placeholderDiv"
								>
									<TextTruncate
										line={3}
										text={placeholder.summary}
										textTruncateChild={
											<Link to={`/targets/${placeholder.user_id}/${dbId}`}>
												See full review
											</Link>
										}
										truncateText="..."
									/>
								</blockquote>

								<Icon inverted name="quote right" />

								<Divider hidden />

								<Header inverted size="medium">
									Can pass an{" "}
									<a
										href="https://www.econlib.org/archives/2011/06/the_ideological.html"
										target="_blank"
										rel="noopener noreferrer"
									>
										Ideological Turing Test
									</a>
									?<Header.Subheader>{Stats(turingTest)}</Header.Subheader>
								</Header>

								<Header inverted size="medium">
									Believes most of what they talk about?
									<Header.Subheader>{Stats(sincerity)}</Header.Subheader>
								</Header>

								<Header size="medium" style={{ marginTop: "16px" }}>
									{ReviewButton(this.props)}
								</Header>
							</Segment>
						</div>
					) : (
						<Segment inverted placeholder>
							<Header icon inverted>
								There aren't any reviews yet...
							</Header>
							{ReviewButton(this.props)}
						</Segment>
					)}
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
	placeholder: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
			summary: PropTypes.string,
			user_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
			user_img: PropTypes.string,
			user_name: PropTypes.string
		})
	]),
	setFallacyId: PropTypes.func,
	sincerity: PropTypes.object,
	turingTest: PropTypes.object,
	userId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	username: PropTypes.string
}

Breakdown.defaultProps = {
	id: 0,
	placeholder: {},
	sincerity: {},
	turingTest: {}
}

export default Breakdown
