import "./style.css"
import { Header, Icon, Label, Message, Progress, Segment } from "semantic-ui-react"
import PropTypes from "prop-types"
import React, { Component } from "react"
import { Link } from "react-router-dom"

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
		this.fetchFallacies(props)
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
		const { authenticated, dbId, setFallacyId, sincerity, turingTest, userId } = this.props
		const RenderFallacies = () => {
			return options.map((result, i) => {
				if (result.key) {
					const percent = parseInt((result.count / this.props.count) * 100, 10)
					return (
						<div
							className="fallacyPercentage"
							key={`breakdownResult${i}`}
							onClick={() => setFallacyId(result.value)}
						>
							<Header size="small">
								{result.key}{" "}
								<Label color="red" size="mini">
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
				<Segment>
					{options.length > 0 ? (
						<Segment basic className="percentages">
							{RenderFallacies()}
						</Segment>
					) : (
						<Message content="No fallacies have been assigned" />
					)}

					<Header className="statHeader first" size="medium">
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

					<Header className="statHeader" size="medium">
						Believes most of what they talk about?
						<Header.Subheader>{Stats(sincerity)}</Header.Subheader>
					</Header>

					<p>
						<Icon color="yellow" name="star" />{" "}
						<Link to={`/targets/${authenticated ? userId : "create"}/${dbId}`}>
							Create a review
						</Link>
					</p>
				</Segment>
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
	setFallacyId: PropTypes.func,
	sincerity: PropTypes.object,
	turingTest: PropTypes.object,
	userId: PropTypes.number,
	username: PropTypes.string
}

Breakdown.defaultProps = {
	sincerity: {},
	turingTest: {}
}

export default Breakdown
