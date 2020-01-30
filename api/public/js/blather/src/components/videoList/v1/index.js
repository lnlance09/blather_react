import "./style.css"
import { fetchPagePosts, searchVideosByText } from "./actions"
import { DebounceInput } from "react-debounce-input"
import { Provider, connect } from "react-redux"
import { Header, Icon, Item, Segment, Visibility } from "semantic-ui-react"
import _ from "lodash"
import LazyLoad from "components/lazyLoad/v1/"
import PropTypes from "prop-types"
import React, { Component } from "react"
import Moment from "react-moment"
import ResultItem from "components/item/v1/"
import store from "store"

class VideoList extends Component {
	constructor(props) {
		super(props)
		this.state = {
			isSearching: false,
			loading: false,
			page: 0,
			q: ""
		}

		this.loadMoreItems = _.debounce(this.loadMoreItems.bind(this), 200)
	}

	componentDidMount() {
		this.props.searchVideosByText({
			channelId: this.props.channelId
		})
	}

	loadMoreItems = () => {
		if (this.props.posts.hasMore) {
			const newPage = parseInt(this.state.page + 1, 10)
			this.setState({ loading: true, page: newPage })
			this.props.searchVideosByText({
				channelId: this.props.channelId,
				q: this.state.q,
				page: newPage
			})
		}
	}

	onChangeYouTubeSearch = value => {
		const isSearching = value !== ""
		this.setState({ isSearching, page: 0, q: value }, () => {
			this.props.searchVideosByText({
				channelId: this.props.channelId,
				q: value
			})
		})
	}


	render() {
		const { isSearching, loading, q } = this.state

		const EmptyMsg = props => {
			if (!props.posts.loading && props.posts.count === 0) {
				return (
					<Segment placeholder>
						<Header icon>
							<Icon className="youtubeIcon" name="youtube" />
							{this.props.emptyMsgContent}
						</Header>
					</Segment>
				)
			}
			return null
		}

		const RenderVideos = this.props.posts.data.map((post, i) => {
			const date = post._source ? post._source.date_created : null
			const dateCreated = <Moment date={date} fromNow />
			let description = post._source ? post._source.description : null
			const id = post._source ? post._source.video_id : null
			const img = post._source ? post._source.img : null
			const title = post._source ? post._source.video_title : null

			if (isSearching) {
				if (post.highlight) {
					description = (
						post.highlight.text.map((text, i) => (
							<p
								dangerouslySetInnerHTML={{
									__html: text
								}}
								key={`transcript${i}`}
							/>
						))
					)
				}
			}

			return (
				<ResultItem
					description={description}
					history={this.props.history}
					id={`videoId${i}`}
					img={img}
					key={`videoId${i}`}
					meta={dateCreated}
					sanitize={false}
					title={_.unescape(title)}
					truncate={false}
					type={id ? "video" : "lazyLoad"}
					url={`/video/${id}`}
				/>
			)
		})

		const lazyLoadMore = props => {
			if (loading && props.posts.hasMore) {
				return <LazyLoad />
			}
		}

		return (
			<Provider store={store}>
				<div className="videoList">
					<Visibility
						continuous
						offset={[50, 50]}
						onBottomVisible={this.loadMoreItems}
					>
						<div className="ui icon input large fluid">
							<DebounceInput
								debounceTimeout={300}
								minLength={2}
								onChange={e => this.onChangeYouTubeSearch(e.target.value)}
								placeholder="Search videos for phrases"
								value={q}
							/>
						</div>
						<Item.Group divided>{RenderVideos}</Item.Group>
						{lazyLoadMore(this.props)}
					</Visibility>
					{EmptyMsg(this.props)}
				</div>
			</Provider>
		)
	}
}

VideoList.propTypes = {
	bearer: PropTypes.string,
	channelId: PropTypes.string,
	emptyMsgContent: PropTypes.string,
	emptyMsgHeader: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
	fetchPagePosts: PropTypes.func,
	page: PropTypes.number,
	posts: PropTypes.oneOfType([
		PropTypes.object,
		PropTypes.shape({
			count: PropTypes.number,
			data: PropTypes.array,
			error: PropTypes.bool,
			errorMsg: PropTypes.string,
			errorType: PropTypes.number,
			hasMore: PropTypes.bool,
			loading: PropTypes.bool
		})
	]),
	searchVideosByText: PropTypes.func
}

VideoList.defaultProps = {
	emptyMsgContent: "",
	emptyMsgHeader: "This channel has not uploaded any videos yet",
	fetchPagePosts,
	page: 0,
	posts: {
		count: 0,
		error: false,
		data: [{}, {}, {}, {}, {}],
		loading: true
	},
	searchVideosByText
}

const mapStateToProps = (state, ownProps) => ({
	...state.videoList,
	...ownProps
})

export default connect(
	mapStateToProps,
	{ fetchPagePosts, searchVideosByText }
)(VideoList)
