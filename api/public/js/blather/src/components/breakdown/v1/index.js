import "./style.css"
import { Header, Icon, Progress, Segment, Statistic } from "semantic-ui-react"
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
		const { sincerity, turingTest } = this.props
		const RenderFallacies = () => {
			return options.map((result, i) => {
				if (result.key) {
					const percent = parseInt((result.count / this.props.count) * 100, 10)
					return (
						<div className="fallacyPercentage" key={`breakdownResult${i}`}>
							<Header size="small">
								<Link
									to={`/fallacies/${result.key
										.toLowerCase()
										.split(" ")
										.join("_")}`}
								>
									{result.key}
								</Link>{" "}
								({result.count})
							</Header>
							<Progress color="purple" percent={percent} progress size="small" />
						</div>
					)
				}
				return null
			})
		}
		const Stats = props => (
			<Segment basic className="stats">
				<Statistic
					className={`${props.yes > props.no ? "bold" : null}`}
					color="green"
					size="mini"
				>
					<Statistic.Value>
						<Icon name="check" /> {props.yes}%
					</Statistic.Value>
				</Statistic>
				<Statistic
					className={`${props.no > props.yes ? "bold" : null}`}
					color="red"
					size="mini"
				>
					<Statistic.Value>
						<Icon name="close" /> {props.no}%
					</Statistic.Value>
				</Statistic>
			</Segment>
		)

		return (
			<div className="breakdown">
				<Segment>
					<Header size="small">
						Quality of arguments
						<Header.Subheader>Most egregious offenses</Header.Subheader>
					</Header>
					<Segment className="percentages">{RenderFallacies()}</Segment>

					<Header className="statHeader" size="small">
						Can pass an{" "}
						<a
							href="https://www.econlib.org/archives/2011/06/the_ideological.html"
							target="_blank"
							rel="noopener noreferrer"
						>
							Ideological Turing Test
						</a>
						?
						<Header.Subheader>
							{turingTest.count} {turingTest.count === 1 ? "person" : "people"}{" "}
							answered
						</Header.Subheader>
					</Header>
					{Stats(turingTest)}

					<Header className="statHeader" size="small">
						Believes most of what they talk about?
						<Header.Subheader>
							{sincerity.count} {sincerity.count === 1 ? "person" : "people"} answered
						</Header.Subheader>
					</Header>
					{Stats(sincerity)}
				</Segment>
			</div>
		)
	}
}

Breakdown.propTypes = {
	count: PropTypes.number,
	id: PropTypes.number,
	name: PropTypes.string,
	network: PropTypes.string,
	sincerity: PropTypes.object,
	turingTest: PropTypes.object
}

Breakdown.defaultProps = {
	sincerity: {},
	turingTest: {}
}

export default Breakdown
