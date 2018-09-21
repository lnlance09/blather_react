import './style.css';
import { fetchPagePosts } from '../../../pages/actions/page';
import { Provider, connect } from 'react-redux';
import { 
    Image,
    Item,
    Message,
    Segment,
    Visibility
} from 'semantic-ui-react';
import _ from 'lodash';
import ParagraphPic from '../../../images/short-paragraph.png';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Moment from 'react-moment';
import ResultItem from '../../item/v1/';
import store from '../../../store';

class VideoList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: false,
            page: 0
        }
        this.loadMoreItems = _.debounce(this.loadMoreItems.bind(this), 200)
    }

    componentWillMount() {
        this.props.fetchPagePosts({
            bearer: this.props.bearer,
            id: this.props.channelId, 
            type: 'youtube'
        })
    }

    loadMoreItems = () => {
        if(this.props.posts.hasMore) {
            const nextPageToken = this.props.posts.nextPageToken
            const newPage = parseInt(this.state.page+1, 10)
            this.setState({ loading: true, page: newPage })
            this.props.fetchPagePosts({
                bearer: this.props.bearer,
                id: this.props.channelId, 
                nextPageToken,
                page: newPage,
                type: 'youtube'
            })
        }
    }

    render() {
        const { loading } = this.state
        const EmptyMsg = props => {
            if(!props.posts.loading && props.posts.count === 0) {
                return (
                    <Message
                        content={this.props.emptyMsgHeader}
                    />
                )
            }
            return null
        }
        const RenderVideos = this.props.posts.data.map((post, i) => {
            let dateCreated = (<Moment date={post.date_created} fromNow />)
            return (
                <ResultItem 
                    description={post.description}
                    history={this.props.history}
                    id={`video_${i}`}
                    img={post.img}
                    key={`video_${i}`}
                    meta={dateCreated}
                    sanitize={false}
                    title={post.title}
                    type={post.id ? 'video' : 'lazyLoad'}
                    url={`/video/${post.id}`}
                />
            )
        })
        const lazyLoadMore = props => {
            if(loading && props.posts.hasMore) {
                return (
                    <Segment className='lazyLoadSegment'>
                        <Image fluid src={ParagraphPic} />
                    </Segment>
                )
            }
        }

        return (
            <Provider store={store}>
                <div className='videoList'>
                    {this.props.posts.count > 0 && (
                        <Visibility 
                            continuous
                            offset={[50,50]}
                            onBottomVisible={this.loadMoreItems} 
                        >
                            <Item.Group>
                                {RenderVideos}
                            </Item.Group>
                            {lazyLoadMore(this.props)}
                        </Visibility>
                    )}
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
    emptyMsgHeader: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string
    ]),
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
    ])
}

VideoList.defaultProps = {
    emptyMsgContent: '',
    emptyMsgHeader: 'This channel has not uploaded any videos yet',
    fetchPagePosts: fetchPagePosts,
    page: 0,
    posts: {
        count: 0,
        error: false,
        data: [{},{},{},{},{}],
        loading: true
    }
}


const mapStateToProps = (state, ownProps) => ({
    ...state.page,
    ...ownProps
})

export default connect(mapStateToProps, { fetchPagePosts })(VideoList)