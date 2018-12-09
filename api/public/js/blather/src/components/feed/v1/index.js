import "./style.css"
import { getFeed } from "./actions"
import { adjustTimezone } from "utils/dateFunctions"
import { formatGrammar } from "utils/textFunctions"
import { connect } from "react-redux"
import { Link } from "react-router-dom"
import { Feed, Image, Item, Visibility } from "semantic-ui-react"
import ImagePic from "images/image-square.png"
import Marked from "marked"
import Moment from "react-moment"
import ParagraphPic from "images/short-paragraph.png"
import PropTypes from "prop-types"
import React, { Component } from "react"

class FeedComponent extends Component {
	constructor(props) {
		super(props)
		this.state = {
			page: 0
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
	}

	componentWillMount() {
		this.props.getFeed({ page: 0 })
	}

	loadMore = () => {
		if (this.props.hasMore) {
			const newPage = parseInt(this.props.page + 1, 10)
			if (newPage > this.state.page) {
				this.setState({ page: newPage })
				this.props.getFeed({ page: newPage })
			}
		}
	}

	render() {
		const RenderFeed = props => {
			return props.results.map((result, i) => {
				if (result.id) {
					return (
						<Feed.Event key={`feed_${i}`}>
							<Feed.Label
								image={result.page_profile_pic}
								onError={i => (i.target.src = ImagePic)}
							/>
							<Feed.Content>
								<Feed.Summary>
									<Link
										to={`/pages/${result.network}/${
											result.network === "twitter"
												? result.page_username
												: result.page_id
										}`}
									>
										{result.page_name}
									</Link>{" "}
									has been charged with {formatGrammar(result.fallacy_name)}{" "}
									<Link to={`/fallacies/${result.id}`}>
										{result.fallacy_name}
									</Link>{" "}
									fallacy by{" "}
									<Link to={`/users/${result.user_username}`}>
										{result.user_name}
									</Link>
									<Feed.Date>
										<Moment
											date={adjustTimezone(result.date_created)}
											fromNow
										/>
									</Feed.Date>
								</Feed.Summary>
								<Feed.Extra text>
									<div
										dangerouslySetInnerHTML={{
											__html: Marked(result.explanation)
										}}
									/>
								</Feed.Extra>
							</Feed.Content>
						</Feed.Event>
					)
				} else {
					return (
						<Item className="itemFeed" key={`feed_${i}`}>
							<Item.Content>
								<Image fluid src={ParagraphPic} />
							</Item.Content>
						</Item>
					)
				}
			})
		}

		return (
			<div className="feed">
				<Visibility className="feedWrapper" continuous onBottomVisible={this.loadMore}>
					<Feed size={this.props.size}>{RenderFeed(this.props)}</Feed>
				</Visibility>
			</div>
		)
	}
}

FeedComponent.propTypes = {
	getFeed: PropTypes.func,
	hasMore: PropTypes.bool,
	page: PropTypes.number,
	results: PropTypes.array,
	size: PropTypes.string
}

FeedComponent.defaultProps = {
	getFeed: getFeed,
	page: 0,
	results: [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}],
	size: "large"
}

const mapStateToProps = (state, ownProps) => ({
	...state.feed,
	...ownProps
})

export default connect(
	mapStateToProps,
	{ getFeed }
)(FeedComponent)
