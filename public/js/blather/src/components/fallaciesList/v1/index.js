import './style.css';
import { getFallacies } from './actions';
import { adjustTimezone } from '../../../utils/dateFunctions';
import { connect, Provider } from 'react-redux';
import { 
    Dropdown,
    Form,
    Image,
    Item,
    Message,
    Visibility
} from 'semantic-ui-react';
import fallacies from '../../../fallacies.json';
import ImagePic from '../../../images/image-square.png';
import Moment from 'react-moment';
import ParagraphPic from '../../../images/short-paragraph.png';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ResultItem from '../../item/v1/';
import store from '../../../store';

class FallaciesList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            assignedBy: null,
            assignedTo: null,
            commentId: null,
            fallacyId: 0,
            loadingMore: false,
            network: '',
            objectId: null,
            options: [],
            q: '',
            page: 0
        }

        this.onChangeSearch = this.onChangeSearch.bind(this)
    }

    componentDidMount() {
        this.fetchFallacies()
        this.props.getFallacies({
            assignedBy: this.props.assignedBy,
            assignedTo: this.props.assignedTo,
            commentId: this.props.commentId,
            fallacies: this.state.fallaces,
            network: this.props.network,
            objectId: this.props.objectId,
            page: this.props.page
        })
    }

    fetchFallacies() {
        let id = ''
        switch(this.props.source) {
            case'pages':
                id = this.props.assignedTo
                break
            case'post':
                id = this.props.objectId
                break
            case'users':
                id = this.props.assignedBy
                break
            default:
                id = ''
        }
        const qs = `?id=${id}&type=${this.props.source}`
        return fetch(`${window.location.origin}/api/fallacies/uniqueFallacies${qs}`, {
            headers:{
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if(response.ok) {
                response.json().then(data => {
                    this.setState({ options: data.fallacies })
                })
            }
        }).catch(err => console.log(err))
    }

    loadMore = () => {
        if(this.props.hasMore) {
            const newPage = parseInt(this.state.page+1,10)
            this.setState({ 
                loadingMore: true,
                page: newPage
            })
            this.props.getFallacies({
                assignedBy: this.props.assignedBy,
                assignedTo: this.props.assignedTo,
                commentId: this.props.commentId,
                fallacies: this.state.fallacies,
                network: this.props.network,
                objectId: this.props.objectId,
                page: newPage
            })
        }
    }

    onChangeSearch = (e, { value }) => {
        this.setState({ fallacies: value, page: 0, value })
        this.props.getFallacies({
            assignedBy: this.props.assignedBy,
            assignedTo: this.props.assignedTo,
            commentId: this.props.commentId,
            fallacies: value,
            network: this.props.network,
            objectId: this.props.objectId,
            page: 0
        })
    }

    render() {
        const { options, value } = this.state
        const FilterSection = ({props}) => (
            <div className='fallaciesFilter'>
                <Form onSubmit={this.onSubmitForm}>
                    <Form.Field>
                        <Dropdown 
                            fluid
                            onChange={this.onChangeSearch}
                            options={options}
                            placeholder='Filter by fallacy'
                            selection
                            value={value}
                        />
                    </Form.Field>
                </Form>
            </div>
        )
        const renderFallacies = props => {
            return props.results.map((result, i) => {
                if(result.id) {
                    let img = props.assignedBy ? result.page_profile_pic : result.user_img
                    let meta = (
                        <div>
                            {result.fallacy_name} - <Moment date={adjustTimezone(result.date_created)} fromNow />
                        </div>
                    )
                    return (
                        <ResultItem 
                            description={result.explanation}
                            extra={{
                                count: result.view_count,
                                term: 'view'
                            }}
                            history={this.props.history}
                            id={`fallacy_${i}`}
                            img={img}
                            key={`fallacy_${i}`}
                            meta={meta}
                            sanitize
                            title={result.title}
                            type='fallacy'
                            url={`/fallacies/${result.id}`}
                        />
                    )
                } else {
                    return (
                        <Item key={`fallacy_${i}`}>
                            <Item.Image size='small' src={ImagePic} />
                            <Item.Content>
                                <Image fluid src={ParagraphPic} />
                            </Item.Content>
                        </Item>
                    )
                }
            })
        }

        return (
            <Provider store={store}>
                <div className='fallaciesList'>
                    {this.props.results.length > 0 && (
                        <div>
                            <FilterSection props={this.props} />
                            <Visibility 
                                continuous
                                onBottomVisible={this.loadMore} 
                                style={{ marginTop: '14px' }}
                            >
                                <Item.Group className='fallacyItems'>
                                    {renderFallacies(this.props)}
                                </Item.Group>
                            </Visibility>
                        </div>
                    )}
                    {this.props.results.length === 0 && (
                        <div className='emptyFallaciesContainer'>
                            <Message
                                content={this.props.emptyMsgContent}
                                header={this.props.emptyMsgHeader}
                            />
                        </div>
                    )}
                </div>
            </Provider>
        )
    }
}

FallaciesList.propTypes = {
    assignedBy: PropTypes.number,
    assignedTo: PropTypes.string,
    commentId: PropTypes.string,
    emptyMsgContent: PropTypes.string,
    emptyMsgHeader: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.string
    ]),
    fallacies: PropTypes.array,
    fallacyId: PropTypes.number,
    getFallacies: PropTypes.func,
    network: PropTypes.string,
    objectId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string
    ]), 
    page: PropTypes.number,
    results: PropTypes.array,
    source: PropTypes.string
}

FallaciesList.defaultProps = {
    emptyMsgContent: 'Try searching something else...',
    emptyMsgHeader: 'No fallacies',
    fallacies: fallacies,
    getFallacies: getFallacies,
    page: 0,
    results: [{},{},{},{},{},{},{},{},{},{}]
}

const mapStateToProps = (state, ownProps) => ({
    ...state.fallacies,
    ...ownProps
})

export default connect(mapStateToProps, { getFallacies })(FallaciesList);